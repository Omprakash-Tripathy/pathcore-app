"""
rule_engine.py
Demographically-stratified clinical rule engine.

Maps measured biomarker values against age/sex-adjusted physiological
reference ranges. This is the core "explainable" logic behind the
Report Accuracy & Physiological Deviation Flagging system — every
number this file produces can be traced back to a specific rule.

NOTE: The reference ranges below are simplified, illustrative values
for a student capstone prototype. They are NOT validated for clinical
use and must never be used on real patient data. A production version
would source ranges from a validated clinical reference (e.g. Tietz,
or the lab's own validated internal ranges) and would go through the
NABL/ISO 15189 method-validation process described in the project's
regulatory roadmap before being used on live reports.
"""

# Each biomarker maps to a function that returns (low, high, unit)
# given age (in years) and sex ("M" or "F").

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
    Each finding carries enough detail to build an explainable rule trace.
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
            "rule_trace": (
                f"{rule['label']} = {value} {unit}. Reference range for "
                f"age {age}, sex {sex}: {low}-{high} {unit}. "
                + (
                    "Within range."
                    if status == "normal"
                    else f"{'Below' if status == 'low' else 'Above'} range by "
                         f"{round(deviation_pct, 1)}%."
                )
            ),
        })

    return findings


def biomarker_severity_score(findings):
    """
    Converts biomarker findings into a 0-6 sub-score contributing to the
    overall 1-10 risk score. Severity scales with how far out of range
    the most deviated parameter is.
    """
    if not findings:
        return 0, None

    abnormal = [f for f in findings if f["status"] != "normal"]
    if not abnormal:
        return 0, None

    worst = max(abnormal, key=lambda f: f["deviation_pct"])
    pct = worst["deviation_pct"]

    if pct < 10:
        return 2, worst
    if pct < 25:
        return 4, worst
    return 6, worst
