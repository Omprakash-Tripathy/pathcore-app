"""
app.py
PathCore prototype API -- Report Accuracy & Physiological Deviation
Flagging system.

Endpoints:
  GET  /api/health          -> liveness check
  GET  /api/sample-cases    -> three preset demo cases
  POST /api/analyze         -> full pipeline on one report
  POST /api/batch-analyze   -> full pipeline on a CSV of many reports
  GET  /api/history         -> audit trail of past analyses
  GET  /api/history/summary -> tier counts across the audit trail
  GET  /api/sample-batch.csv -> downloadable example CSV for batch upload
  POST /api/narrative       -> optional Claude-generated narrative + patient summary

IMPORTANT: This prototype is for demonstration only, using synthetic
data. It is advisory-only by design: it never auto-approves anything.
It must not be pointed at real patient data.
"""

import json
import os
import csv
import io
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from rule_engine import evaluate_biomarkers, biomarker_severity_score
from nlp_parser import parse_impression, nlp_severity_score
from ml_risk_model import risk_model
from llm_report import generate_narrative
from narrative_previews import get_preview as get_narrative_preview
import db

app = Flask(__name__)
CORS(app)

SAMPLE_CASES_PATH = os.path.join(os.path.dirname(__file__), "sample_cases.json")

db.init_db()


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
                f"({f['deviation_pct']}% deviation, z={f['z_score']})."
            )

    if active_nlp:
        phrases = ", ".join(sorted(set(f["phrase"] for f in active_nlp)))
        lines.append(f"Impression text flagged for: {phrases}.")

    lines.append(
        "This is a system-generated draft for pathologist review. It is advisory only "
        "and carries no diagnostic authority until signed by a registered pathologist."
    )
    return " ".join(lines)


def run_pipeline(age, sex, biomarkers, impression_text):
    """Runs the full rule engine + NLP + ML cross-check pipeline on one
    report. Shared by both /api/analyze and /api/batch-analyze so the
    two endpoints can never silently drift apart."""
    biomarker_findings = evaluate_biomarkers(age, sex, biomarkers)
    bio_score, worst_finding = biomarker_severity_score(biomarker_findings)

    nlp_flags = parse_impression(impression_text)
    nlp_score = nlp_severity_score(nlp_flags)

    raw_score = bio_score + nlp_score
    risk_score = max(1, min(10, raw_score if raw_score > 0 else 1))

    recommendation, recommendation_detail = build_recommendation(risk_score)
    draft_report = build_draft_report(age, sex, biomarker_findings, nlp_flags, risk_score)

    ml_result = risk_model.predict(age, sex, biomarkers)

    return {
        "risk_score": risk_score,
        "recommendation": recommendation,
        "recommendation_detail": recommendation_detail,
        "biomarker_findings": biomarker_findings,
        "nlp_flags": nlp_flags,
        "draft_report": draft_report,
        "statistical_model": ml_result,
        "disclaimer": (
            "Advisory only. This output does not constitute a diagnosis and requires "
            "mandatory review and sign-off by a registered pathologist before dispatch."
        ),
    }


def _parse_single_input(data):
    age = float(data.get("age"))
    sex = data.get("sex", "M").upper()
    if sex not in ("M", "F"):
        sex = "M"
    biomarkers = data.get("biomarkers", {})
    impression_text = data.get("impression_text", "")
    return age, sex, biomarkers, impression_text


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
        age, sex, biomarkers, impression_text = _parse_single_input(data)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid input. 'age' must be a number."}), 400

    result = run_pipeline(age, sex, biomarkers, impression_text)

    db.insert_analysis(
        age, sex, biomarkers, impression_text,
        result["risk_score"], result["recommendation"],
        result["statistical_model"]["probability"], source="single",
    )

    return jsonify(result)


@app.route("/api/batch-analyze", methods=["POST"])
def batch_analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send a CSV under the 'file' field."}), 400

    file = request.files["file"]
    try:
        text = file.read().decode("utf-8-sig")
    except UnicodeDecodeError:
        return jsonify({"error": "Could not read the file as UTF-8 text."}), 400

    reader = csv.DictReader(io.StringIO(text))
    required = {"age", "sex", "hemoglobin", "wbc", "platelets", "glucose", "creatinine", "alt"}
    if not required.issubset(set(h.strip() for h in (reader.fieldnames or []))):
        return jsonify({
            "error": "CSV is missing required columns.",
            "required_columns": sorted(required) + ["impression_text (optional)"],
        }), 400

    results = []
    errors = []
    for i, row in enumerate(reader, start=2):  # row 1 is the header
        try:
            age = float(row["age"])
            sex = row["sex"].strip().upper()
            if sex not in ("M", "F"):
                sex = "M"
            biomarkers = {
                k: row.get(k, "") for k in
                ["hemoglobin", "wbc", "platelets", "glucose", "creatinine", "alt"]
            }
            impression_text = row.get("impression_text", "") or ""

            result = run_pipeline(age, sex, biomarkers, impression_text)
            db.insert_analysis(
                age, sex, biomarkers, impression_text,
                result["risk_score"], result["recommendation"],
                result["statistical_model"]["probability"], source="batch",
            )
            results.append({
                "row": i, "age": age, "sex": sex, "biomarkers": biomarkers,
                "impression_text": impression_text, **result,
            })
        except (ValueError, KeyError) as e:
            errors.append({"row": i, "error": str(e)})

    results.sort(key=lambda r: r["risk_score"], reverse=True)

    summary = {
        "total": len(results),
        "approve_count": sum(1 for r in results if r["recommendation"] == "APPROVE"),
        "review_count": sum(1 for r in results if r["recommendation"] == "REVIEW"),
        "escalate_count": sum(1 for r in results if r["recommendation"] == "ESCALATE"),
        "errors": len(errors),
    }

    return jsonify({"summary": summary, "results": results, "row_errors": errors})


@app.route("/api/history", methods=["GET"])
def history():
    limit = request.args.get("limit", default=100, type=int)
    tier = request.args.get("tier", default=None, type=str)
    return jsonify({"analyses": db.get_history(limit=limit, tier=tier)})


@app.route("/api/history/summary", methods=["GET"])
def history_summary():
    return jsonify(db.get_summary())


@app.route("/api/narrative", methods=["POST"])
def narrative():
    data = request.get_json(force=True) or {}

    case_id = data.get("case_id")
    if case_id:
        preview = get_narrative_preview(case_id)
        if preview:
            return jsonify(preview)

    try:
        age = data["age"]
        sex = data["sex"]
        biomarker_findings = data["biomarker_findings"]
        nlp_flags = data["nlp_flags"]
        risk_score = data["risk_score"]
        recommendation = data["recommendation"]
        statistical_model = data.get("statistical_model")
    except KeyError as e:
        return jsonify({"available": False, "error": f"Missing field: {e}"}), 400

    result = generate_narrative(
        age, sex, biomarker_findings, nlp_flags,
        risk_score, recommendation, statistical_model,
    )
    return jsonify(result)


@app.route("/api/sample-batch.csv", methods=["GET"])
def sample_batch_csv():
    rows = [
        ["age", "sex", "hemoglobin", "wbc", "platelets", "glucose", "creatinine", "alt", "impression_text"],
        [34, "F", 13.2, 6.8, 260, 88, 0.8, 22, "No evidence of malignancy."],
        [52, "F", 10.8, 7.5, 240, 94, 0.9, 28, "Mild anemia noted."],
        [61, "M", 7.9, 18.4, 95, 112, 2.1, 65, "Findings suspicious for malignancy."],
        [40, "M", 15.0, 6.0, 300, 99, 1.25, 39, "All parameters within normal limits."],
        [70, "F", 11.9, 9.0, 180, 101, 1.05, 30, "Recommend clinical correlation."],
    ]
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerows(rows)
    return Response(
        buf.getvalue(), mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=pathcore_sample_batch.csv"},
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
