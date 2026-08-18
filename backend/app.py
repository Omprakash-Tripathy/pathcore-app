"""
app.py
PathCore prototype API — Report Accuracy & Physiological Deviation
Flagging system.

Endpoints:
  GET  /api/health         -> simple liveness check
  GET  /api/sample-cases   -> three preset demo cases (normal/borderline/critical)
  POST /api/analyze        -> runs the rule engine + NLP parser, returns a risk score

IMPORTANT: This prototype is for demonstration only, using synthetic
data. It is advisory-only by design: it never auto-approves anything.
It must not be pointed at real patient data.
"""

import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from rule_engine import evaluate_biomarkers, biomarker_severity_score
from nlp_parser import parse_impression, nlp_severity_score

app = Flask(__name__)
CORS(app)  # allow the React frontend (different origin) to call this API

SAMPLE_CASES_PATH = os.path.join(os.path.dirname(__file__), "sample_cases.json")


def build_recommendation(risk_score):
    if risk_score <= 3:
        return "APPROVE", "Pre-validated draft — routed for fast pathologist sign-off."
    if risk_score <= 7:
        return "REVIEW", "Standard pathologist review required."
    return "ESCALATE", "High-priority — routed to senior pathologist for escalation."


def build_draft_report(age, sex, biomarker_findings, nlp_flags, risk_score):
    abnormal = [f for f in biomarker_findings if f["status"] != "normal"]
    active_nlp = [f for f in nlp_flags if not f["negated"]]

    lines = [f"Patient: Age {age}, Sex {sex}."]

    if not abnormal:
        lines.append("All measured biomarkers fall within age/sex-adjusted physiological limits.")
    else:
        for f in abnormal:
            direction = "below" if f["status"] == "low" else "above"
            lines.append(
                f"{f['label']} is {f['value']} {f['unit']}, which is {direction} the "
                f"reference range of {f['reference_low']}-{f['reference_high']} {f['unit']} "
                f"({f['deviation_pct']}% deviation)."
            )

    if active_nlp:
        phrases = ", ".join(sorted(set(f["phrase"] for f in active_nlp)))
        lines.append(f"Impression text flagged for: {phrases}.")

    lines.append(
        "This is a system-generated draft for pathologist review. It is advisory only "
        "and carries no diagnostic authority until signed by a registered pathologist."
    )
    return " ".join(lines)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "pathcore-prototype"})


@app.route("/api/sample-cases", methods=["GET"])
def sample_cases():
    with open(SAMPLE_CASES_PATH) as f:
        return jsonify(json.load(f))


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True) or {}

    try:
        age = float(data.get("age"))
        sex = data.get("sex", "M").upper()
        if sex not in ("M", "F"):
            sex = "M"
        biomarkers = data.get("biomarkers", {})
        impression_text = data.get("impression_text", "")
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input. 'age' must be a number."}), 400

    # --- Rule engine ---
    biomarker_findings = evaluate_biomarkers(age, sex, biomarkers)
    bio_score, worst_finding = biomarker_severity_score(biomarker_findings)

    # --- NLP parser ---
    nlp_flags = parse_impression(impression_text)
    nlp_score = nlp_severity_score(nlp_flags)

    # --- Combine into 1-10 risk score ---
    raw_score = bio_score + nlp_score
    risk_score = max(1, min(10, raw_score if raw_score > 0 else 1))

    recommendation, recommendation_detail = build_recommendation(risk_score)
    draft_report = build_draft_report(age, sex, biomarker_findings, nlp_flags, risk_score)

    return jsonify({
        "risk_score": risk_score,
        "recommendation": recommendation,
        "recommendation_detail": recommendation_detail,
        "biomarker_findings": biomarker_findings,
        "nlp_flags": nlp_flags,
        "draft_report": draft_report,
        "disclaimer": (
            "Advisory only. This output does not constitute a diagnosis and requires "
            "mandatory review and sign-off by a registered pathologist before dispatch."
        ),
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
