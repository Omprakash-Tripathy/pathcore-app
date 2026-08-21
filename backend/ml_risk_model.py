"""
ml_risk_model.py
A small, interpretable statistical cross-check for the rule engine.

WHY THIS EXISTS: the rule engine (rule_engine.py) evaluates each
biomarker independently against its own reference range. That is
exactly what makes it explainable -- but it also means it cannot see
patterns that only appear ACROSS biomarkers. A patient whose glucose,
creatinine, and ALT are each individually just inside their normal
range, but all three sitting near the high end simultaneously, would
score as fully "normal" under pure per-parameter thresholding, even
though that joint pattern is itself worth a second look.

This model is trained on a synthetically generated dataset with that
exact kind of hidden multivariate signal built in on purpose (see
_generate_synthetic_dataset below), so it learns to notice it.

FEATURE DESIGN: each biomarker is fed to the model as its ABSOLUTE
z-score (how many standard deviations it sits from its own
demographic mean -- the same statistic rule_engine.py now reports),
not its raw value. This is a deliberate choice: several biomarkers
(hemoglobin, WBC, platelets) are risky when too LOW or too HIGH -- a
"U-shaped" relationship a plain linear model cannot represent from a
raw value. Using |z| turns that into a monotonic "how abnormal is
this, regardless of direction" feature, which is both easier for a
linear model to learn correctly and more directly interpretable.

This is a logistic regression, not a black box: every prediction
ships with its top contributing features, computed directly from the
model's own learned coefficients, so a pathologist can see exactly
which inputs pushed the score up or down -- the same "nothing hidden"
principle the rule engine follows.

This is a genuine, if small, classification model (per the capstone's
"AI capability" requirement), trained once when the server starts, on
synthetic data only. It is a research/demo cross-check, not a
validated diagnostic model, and is presented to the user as exactly
that.
"""

import random
import math

from rule_engine import BIOMARKER_RULES

BIOMARKER_KEYS = list(BIOMARKER_RULES.keys())
FEATURE_ORDER = ["age", "sex_m"] + [f"z_{k}" for k in BIOMARKER_KEYS]

LABEL_MAP = {"age": "Age", "sex_m": "Sex"}
for _k, _rule in BIOMARKER_RULES.items():
    LABEL_MAP[f"z_{_k}"] = _rule["label"] + " deviation"


def _ranges_for(age, sex):
    return {k: rule["fn"](age, sex)[:2] for k, rule in BIOMARKER_RULES.items()}


def _abs_z(value, low, high):
    mean = (low + high) / 2
    sd = (high - low) / 4
    return abs((value - mean) / sd) if sd else 0.0


def _generate_synthetic_dataset(n=2500, seed=7):
    """
    Three explicit patient categories, so class balance is controlled
    rather than an accident of random noise:

      - ~60% "healthy": every biomarker close to its range midpoint
        -> label 0.
      - ~18% "single abnormality": one biomarker pushed clearly
        outside its range (the rule engine alone already catches
        these) -> label 1.
      - ~22% "joint pattern": every biomarker individually WITHIN
        range, but glucose, creatinine, and ALT all sitting in the
        upper third of their own normal range at once -> label 1.
        This is the pattern invisible to per-parameter thresholding,
        and the whole reason this model exists.

    A little label noise (4%) is added so the model learns a soft
    boundary rather than memorizing the rule.
    """
    rng = random.Random(seed)
    rows, labels = [], []

    for _ in range(n):
        age = rng.uniform(5, 85)
        sex = rng.choice(["M", "F"])
        ranges = _ranges_for(age, sex)
        raw = {}

        roll = rng.random()

        if roll < 0.60:
            for key, (low, high) in ranges.items():
                mid = (low + high) / 2
                sd = (high - low) / 8
                raw[key] = max(0.01, rng.gauss(mid, sd))
            label = 0

        elif roll < 0.78:
            for key, (low, high) in ranges.items():
                mid = (low + high) / 2
                sd = (high - low) / 6
                raw[key] = max(0.01, rng.gauss(mid, sd))
            bad_key = rng.choice(list(ranges.keys()))
            low, high = ranges[bad_key]
            width = high - low
            if rng.random() < 0.5:
                raw[bad_key] = max(0.01, low - width * rng.uniform(0.15, 0.6))
            else:
                raw[bad_key] = high + width * rng.uniform(0.15, 0.6)
            label = 1

        else:
            for key, (low, high) in ranges.items():
                if key in ("glucose", "creatinine", "alt"):
                    lo_bound = low + (high - low) * 0.68
                    raw[key] = rng.uniform(lo_bound, high * 0.99)
                else:
                    mid = (low + high) / 2
                    sd = (high - low) / 6
                    raw[key] = max(0.01, rng.gauss(mid, sd))
            label = 1

        row = {"age": age, "sex_m": 1.0 if sex == "M" else 0.0}
        for key in BIOMARKER_KEYS:
            low, high = ranges[key]
            row[f"z_{key}"] = _abs_z(raw[key], low, high)

        rows.append(row)
        if rng.random() < 0.04:
            label = 1 - label
        labels.append(label)

    return rows, labels


def _train_logistic_regression(X, y, lr=0.15, epochs=350, l2=0.15):
    """Plain-Python gradient descent logistic regression -- the
    dataset is small enough that no external ML library is needed,
    which also keeps every step of training visible and auditable."""
    n_features = len(X[0])
    weights = [0.0] * n_features
    bias = 0.0
    n = len(X)

    for _ in range(epochs):
        grad_w = [0.0] * n_features
        grad_b = 0.0
        for xi, yi in zip(X, y):
            z = bias + sum(w * x for w, x in zip(weights, xi))
            pred = 1 / (1 + math.exp(-max(-30, min(30, z))))
            err = pred - yi
            for j in range(n_features):
                grad_w[j] += err * xi[j]
            grad_b += err
        for j in range(n_features):
            weights[j] -= lr * (grad_w[j] / n + l2 * weights[j])
        bias -= lr * (grad_b / n)

    return weights, bias


class RiskModel:
    def __init__(self):
        rows, labels = _generate_synthetic_dataset()

        self.means = {f: sum(r[f] for r in rows) / len(rows) for f in FEATURE_ORDER}
        self.stds = {
            f: (sum((r[f] - self.means[f]) ** 2 for r in rows) / len(rows)) ** 0.5
            for f in FEATURE_ORDER
        }

        X = [
            [(r[f] - self.means[f]) / (self.stds[f] or 1.0) for f in FEATURE_ORDER]
            for r in rows
        ]
        self.weights, self.bias = _train_logistic_regression(X, labels)

    def predict(self, age, sex, biomarkers):
        ranges = _ranges_for(age, sex)
        row = {"age": age, "sex_m": 1.0 if sex == "M" else 0.0}
        for key in BIOMARKER_KEYS:
            low, high = ranges[key]
            raw = biomarkers.get(key)
            value = float(raw) if raw not in (None, "") else (low + high) / 2
            row[f"z_{key}"] = _abs_z(value, low, high)

        x = [(row[f] - self.means[f]) / (self.stds[f] or 1.0) for f in FEATURE_ORDER]
        z = self.bias + sum(w * xi for w, xi in zip(self.weights, x))
        probability = 1 / (1 + math.exp(-max(-30, min(30, z))))

        contributions = [
            {"feature": f, "contribution": round(w * xi, 3)}
            for f, w, xi in zip(FEATURE_ORDER, self.weights, x)
        ]
        contributions.sort(key=lambda c: abs(c["contribution"]), reverse=True)
        top = contributions[:3]

        trace = (
            f"Logistic regression trained on {len(FEATURE_ORDER)} standardized "
            f"features (age, sex, and each biomarker's deviation from its own "
            f"demographic mean) over a synthetic reference population. "
            f"Predicted probability of elevated risk: {probability:.2f}. "
            f"Top contributing factors: " + ", ".join(
                f"{LABEL_MAP[c['feature']]} ({'+' if c['contribution'] >= 0 else ''}{c['contribution']:.2f})"
                for c in top
            ) + "."
        )

        return {
            "probability": round(probability, 3),
            "top_contributors": [
                {"feature": LABEL_MAP[c["feature"]], "contribution": c["contribution"]}
                for c in top
            ],
            "model_trace": trace,
        }


# Trained once, at import time, when the Flask process starts.
risk_model = RiskModel()
