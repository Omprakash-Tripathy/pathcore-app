"""
llm_report.py
Optional Claude-powered narrative generation, layered strictly on TOP
of the deterministic pipeline -- never inside it.

WHERE THIS SITS IN THE ARCHITECTURE (read this before touching the
prompt): the risk score, the tier (APPROVE/REVIEW/ESCALATE), every
biomarker's status, and the statistical cross-check probability are
ALL already computed by rule_engine.py and ml_risk_model.py before
this file is ever called. Claude is given those numbers as fixed,
given facts -- it is never asked to compute, revise, or second-guess
any of them. Its only job is turning already-decided structured
findings into two pieces of well-written prose: a clinical narrative
and a patient-facing plain-language summary. This keeps the "rule
engine + stats, not a black box" architecture from the strategy deck
completely intact -- an LLM here is a communication layer, not a
decision-maker.

Uses Python's built-in urllib -- no extra pip dependency, so this adds
zero deployment risk to requirements.txt.

Requires an ANTHROPIC_API_KEY environment variable. If it's not set,
generate_narrative() returns a clear, structured "not configured"
result instead of raising -- the rest of the app must keep working
with zero AI narrative available.
"""

import os
import json
import urllib.request
import urllib.error

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
ANTHROPIC_VERSION = "2023-06-01"
MODEL = "claude-haiku-4-5-20251001"
TIMEOUT_SECONDS = 30

SECTION_CLINICAL = "===CLINICAL==="
SECTION_PATIENT = "===PATIENT==="

SYSTEM_PROMPT = (
    "You are a clinical documentation assistant that formats already-"
    "computed pathology lab findings into clear written text. You do "
    "not diagnose, score, or assess risk -- a separate deterministic "
    "system has already done that, and its risk tier is final. You "
    "NEVER invent, estimate, round differently, or alter any value, "
    "range, or finding given to you; you only rephrase and organize "
    "exactly what you are given. If a value is not provided, do not "
    "mention it. Every response must include, verbatim, the two "
    "section markers shown in the instructions, in that exact order, "
    "with nothing before the first marker and nothing after the "
    "content of the second section."
)


def _build_user_prompt(age, sex, biomarker_findings, nlp_flags,
                        risk_score, recommendation, statistical_model):
    abnormal = [f for f in biomarker_findings if f["status"] != "normal"]
    active_nlp = [f for f in nlp_flags if not f["negated"]]

    lines = [
        f"Patient: age {age}, sex {sex}.",
        f"Pre-computed risk score: {risk_score}/10. Tier: {recommendation}.",
    ]

    lines.append("Biomarker findings:")
    for f in biomarker_findings:
        lines.append(
            f"  - {f['label']}: {f['value']} {f['unit']} "
            f"(reference {f['reference_low']}-{f['reference_high']} {f['unit']}, "
            f"status: {f['status']}, z-score: {f['z_score']})"
        )

    if active_nlp:
        lines.append("Impression text flags (not negated):")
        for f in active_nlp:
            lines.append(f"  - \"{f['phrase']}\" ({f['severity']})")

    if statistical_model:
        lines.append(
            f"Independent statistical cross-check: {statistical_model['probability']:.0%} "
            f"probability of elevated risk, driven mainly by: " +
            ", ".join(c["feature"] for c in statistical_model["top_contributors"])
        )

    lines.append("")
    lines.append(
        "Using ONLY the facts above, write two things:\n"
        f"1. After the marker {SECTION_CLINICAL} on its own line: a short, "
        "professional clinical narrative (3-5 sentences) in standard "
        "pathology report style, suitable for a pathologist to review "
        "alongside the raw data. State which parameters are abnormal and "
        "by how much, and mention any flagged impression phrases. End "
        "with a one-sentence reminder that this is advisory only and "
        "requires pathologist sign-off.\n"
        f"2. After the marker {SECTION_PATIENT} on its own line: a short "
        "(2-4 sentence) plain-language summary a patient without a "
        "medical background could understand, calm in tone, that does "
        "not use the words 'risk score' or clinical jargon, and "
        "explicitly says their doctor will review the results."
    )

    return "\n".join(lines)


def _parse_sections(text):
    if SECTION_CLINICAL not in text or SECTION_PATIENT not in text:
        return None
    clinical = text.split(SECTION_CLINICAL, 1)[1].split(SECTION_PATIENT)[0].strip()
    patient = text.split(SECTION_PATIENT, 1)[1].strip()
    return clinical, patient


def generate_narrative(age, sex, biomarker_findings, nlp_flags,
                        risk_score, recommendation, statistical_model):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return {
            "available": False,
            "error": "ANTHROPIC_API_KEY is not configured on the server.",
        }

    user_prompt = _build_user_prompt(
        age, sex, biomarker_findings, nlp_flags,
        risk_score, recommendation, statistical_model,
    )

    payload = json.dumps({
        "model": MODEL,
        "max_tokens": 700,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        ANTHROPIC_API_URL,
        data=payload,
        method="POST",
        headers={
            "x-api-key": api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        return {
            "available": False,
            "error": f"Anthropic API returned {e.code}: {detail[:200]}",
        }
    except urllib.error.URLError as e:
        return {"available": False, "error": f"Could not reach Anthropic API: {e.reason}"}
    except Exception as e:
        return {"available": False, "error": f"Unexpected error: {e}"}

    try:
        raw_text = "".join(
            block.get("text", "") for block in body.get("content", [])
            if block.get("type") == "text"
        )
    except Exception:
        return {"available": False, "error": "Unexpected response shape from Anthropic API."}

    parsed = _parse_sections(raw_text)
    if not parsed:
        return {
            "available": False,
            "error": "Model response did not include the expected section markers.",
            "raw": raw_text[:500],
        }

    clinical, patient = parsed
    return {
        "available": True,
        "clinical_narrative": clinical,
        "patient_summary": patient,
        "model": MODEL,
        "disclaimer": (
            "AI-generated narrative (Claude). For communication only -- the "
            "risk score and findings above are computed entirely by the "
            "deterministic rule engine and statistical model, not by this "
            "text. Advisory only; requires pathologist sign-off."
        ),
    }
