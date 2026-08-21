"""
rule_engine.py
Demographically-stratified clinical rule engine.

Maps measured biomarker values against age/sex-adjusted physiological
reference ranges, and computes a z-score-based severity for each one.
This is the core "explainable" logic behind the Report Accuracy &
Physiological Deviation Flagging system -- every number this file
produces can be traced back to a specific rule.

NOTE: The reference ranges below are simplified, illustrative values
for a student capstone prototype. They are NOT validated for clinical
use and must never be used on real patient data. A production version
would source ranges (and their standard deviations) from a validated
clinical reference (e.g. Tietz, or the lab's own validated internal
ranges) and would go through the NABL/ISO 15189 method-validation
process described in the project's regulatory roadmap before being
used on live reports.

Z-SCORE NOTE: each reference range below is treated as the interval
covering roughly the middle ~95% of a healthy population for that
demographic bracket (a standard convention for "normal range" tables).
That means mean = (low + high) / 2 and standard deviation =
(high - low) / 4 (i.e. the range spans about +/- 2 SD). This is a
transparent approximation, not a measured population SD -- it is
disclosed here, in the rule trace, and in the Application Brief.
"""

def hemoglobin_range(age, sex):
    if age < 1:
        return (11.0, 17.0, "g/dL")
    if age < 12:
        return (11.5, 15.5, "g/dL")
    if sex == "F":
        return (12.0, 15.5, "g/dL")
    return (13.5, 17.5, "g/dL")


def wbc_range(age, sex):
    if age < 12:
        return (5.0, 14.5, "x10^3/uL")
    return (4.0, 11.0, "x10^3/uL")


def platelet_range(age, sex):
    return (150, 450, "x10^3/uL")


def glucose_fasting_range(age, sex):
    return (70, 100, "mg/dL")


def creatinine_range(age, sex):
    if age < 12:
        return (0.3, 0.7, "mg/dL")
    if sex == "F":
        return (0.6, 1.1, "mg/dL")
    return (0.7, 1.3, "mg/dL")


def alt_range(age, sex):
    if sex == "F":
        return (7, 35, "U/L")
    return (10, 40, "U/L")


BIOMARKER_RULES = {
    "hemoglobin": {"label": "Hemoglobin", "fn": hemoglobin_range},
    "wbc": {"label": "WBC Count", "fn": wbc_range},
    "platelets": {"label": "Platelet Count", "fn": platelet_range},
    "glucose": {"label": "Fasting Glucose", "fn": glucose_fasting_range},
    "creatinine": {"label": "Creatinine", "fn": creatinine_range},
    "alt": {"label": "ALT (SGPT)", "fn": alt_range},
}


def evaluate_biomarkers(age, sex, biomarkers):
    """
    biomarkers: dict like {"hemoglobin": 9.8, "wbc": 7.2, ...}
    Returns a list of finding dicts, one per biomarker that was supplied.
    Each finding carries a z-score (see module docstring) and enough
    detail to build an explainable rule trace.
    """
    findings = []

    for key, value in biomarkers.items():
        if value is None or value == "":
            continue
        if key not in BIOMARKER_RULES:
            continue

        rule = BIOMARKER_RULES[key]
        low, high, unit = rule["fn"](age, sex)
        value = float(value)

        mean = (low + high) / 2
        sd = (high - low) / 4
        z_score = (value - mean) / sd if sd else 0.0

        if low <= value <= high:
            status = "normal"
            deviation_pct = 0.0
        else:
            status = "low" if value < low else "high"
            bound = low if value < low else high
            deviation_pct = abs(value - bound) / bound * 100

        findings.append({
            "parameter": key,
            "label": rule["label"],
            "value": value,
            "unit": unit,
            "reference_low": low,
            "reference_high": high,
            "status": status,               # normal | low | high
            "deviation_pct": round(deviation_pct, 1),
            "z_score": round(z_score, 2),
            "rule_trace": (
                f"{rule['label']} = {value} {unit}. Reference range for "
                f"age {age}, sex {sex}: {low}-{high} {unit} "
                f"(mean {mean:.1f}, approx SD {sd:.2f}). "
                f"z = {z_score:.2f}. "
                + (
                    "Within range."
                    if status == "normal"
                    else f"{'Below' if status == 'low' else 'Above'} range by "
                         f"{round(deviation_pct, 1)}% ({abs(z_score):.1f} SD from mean)."
                )
            ),
        })

    return findings


def biomarker_severity_score(findings):
    """
    Converts biomarker findings into a sub-score contributing to the
    overall 1-10 risk score.

    Two components, both explainable:
    1. A 2/4/6-point bucket from the single WORST abnormal finding's
       z-score magnitude (as before) -- a value close to the edge of a
       wide range is treated as less severe than one close to the edge
       of a narrow range, which plain percent-deviation cannot
       distinguish.
    2. A multi-parameter bonus of +1 per ADDITIONAL abnormal finding
       beyond the worst one, capped at +3. This exists because looking
       only at the single worst value treats "one biomarker is far out
       of range" identically to "five biomarkers are simultaneously
       far out of range" -- clinically, multiple systems failing at
       once is more concerning than one, and the score should reflect
       that rather than silently capping out on the first severe
       finding.
    """
    if not findings:
        return 0, None, None

    abnormal = [f for f in findings if f["status"] != "normal"]
    if not abnormal:
        return 0, None, None

    worst = max(abnormal, key=lambda f: abs(f["z_score"]))
    z = abs(worst["z_score"])

    if z < 2.5:
        base = 2
    elif z < 4.0:
        base = 4
    else:
        base = 6

    extra_count = len(abnormal) - 1
    bonus = min(3, extra_count)

    note = None
    if bonus > 0:
        others = ", ".join(
            f["label"] for f in abnormal if f is not worst
        )
        note = (
            f"{len(abnormal)} biomarkers simultaneously abnormal "
            f"({worst['label']} plus {others}) -- severity increased by "
            f"{bonus} point{'s' if bonus != 1 else ''} to reflect "
            f"multi-parameter derangement, not just the single worst value."
        )

    return base + bonus, worst, note
