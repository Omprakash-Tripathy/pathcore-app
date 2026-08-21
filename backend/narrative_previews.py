"""
narrative_previews.py
Hand-written illustrative narratives for the 3 built-in sample cases.

WHY THIS EXISTS: generating a live narrative via /api/narrative requires
an ANTHROPIC_API_KEY and a small amount of paid API credit. To let the
"AI-generated narrative" feature be demoed for free and instantly, the
3 sample cases each ship with a hand-written example of what a live
Claude call would produce, grounded in the exact same computed values
(deviation %, z-scores, NLP flags, statistical model probability) the
rest of the app displays for that case.

THIS IS NOT LIVE MODEL OUTPUT. It is clearly labeled as a preview,
both here and in every API response and UI element that surfaces it,
so there is no ambiguity about what is and isn't a live API call. If
ANTHROPIC_API_KEY is later configured, app.py still calls the real
generate_narrative() pipeline for any case that isn't one of these 3
sample IDs -- this file only intercepts the 3 known sample cases.
"""

PREVIEWS = {
    "normal": {
        "clinical_narrative": (
            "All six measured biomarkers fall within their age- and sex-"
            "adjusted reference ranges for this 34-year-old female patient, "
            "with no parameter deviating more than 1 standard deviation from "
            "the demographic mean. The submitted impression text explicitly "
            "notes no evidence of malignancy, and no unnegated critical or "
            "moderate-concern phrases were identified on NLP review. The "
            "independent statistical cross-check concurs, estimating a low "
            "(19%) probability of elevated risk. This is a system-generated "
            "draft for pathologist review; it is advisory only and requires "
            "sign-off by a registered pathologist prior to dispatch."
        ),
        "patient_summary": (
            "Your recent lab results are within the normal range for someone "
            "your age, and there's nothing in the report that raises a "
            "concern. Your doctor will still review the full report as a "
            "routine part of their process, but nothing here needs urgent "
            "attention."
        ),
    },
    "borderline": {
        "clinical_narrative": (
            "This 52-year-old female patient's hemoglobin measures 10.8 g/dL, "
            "approximately 3.4 standard deviations below the demographic "
            "mean (reference range 12.0-15.5 g/dL), consistent with the mild "
            "anemia noted in the submitted impression text. All other "
            "measured biomarkers -- WBC, platelets, fasting glucose, "
            "creatinine, and ALT -- fall within their respective reference "
            "ranges. The independent statistical cross-check estimates a "
            "77% probability of elevated risk, driven primarily by the "
            "hemoglobin deviation. This finding is routed for standard "
            "pathologist review. This is a system-generated draft for "
            "pathologist review; it is advisory only and requires sign-off "
            "by a registered pathologist prior to dispatch."
        ),
        "patient_summary": (
            "Your results show your hemoglobin level is a bit lower than "
            "typical, which can be a sign of mild anemia -- a common and "
            "usually manageable finding. Everything else in your results "
            "looks normal. Your doctor will go over these results with you "
            "and let you know if any follow-up is needed."
        ),
    },
    "critical": {
        "clinical_narrative": (
            "This 61-year-old male patient presents with multiple biomarkers "
            "significantly outside their age- and sex-adjusted reference "
            "ranges: hemoglobin 7.9 g/dL (41.5% below the lower bound, "
            "z=-7.6), WBC count 18.4 x10^3/uL (67.3% above the upper bound, "
            "z=6.23), platelet count 95 x10^3/uL (36.7% below the lower "
            "bound, z=-2.73), fasting glucose 112 mg/dL (z=3.6), creatinine "
            "2.1 mg/dL (61.5% above the upper bound, z=7.33), and ALT 65 U/L "
            "(62.5% above the upper bound, z=5.33). The submitted impression "
            "text additionally flags 'blast cells' and 'malignancy,' neither "
            "of which is negated. The independent statistical cross-check "
            "concurs, estimating essentially certain (100%) elevated risk. "
            "Taken together, these findings warrant urgent senior "
            "pathologist review. This is a system-generated draft for "
            "pathologist review; it is advisory only and requires sign-off "
            "by a registered pathologist prior to dispatch."
        ),
        "patient_summary": (
            "Your results show a few values outside the typical range that "
            "your care team wants to look at closely and promptly. This "
            "doesn't mean a diagnosis has been made -- it means your doctor "
            "wants to review these findings carefully and may follow up with "
            "you soon. Please make sure you're reachable for a follow-up "
            "call from your care team."
        ),
    },
}


def get_preview(case_id):
    entry = PREVIEWS.get(case_id)
    if not entry:
        return None
    return {
        "available": True,
        "preview": True,
        "clinical_narrative": entry["clinical_narrative"],
        "patient_summary": entry["patient_summary"],
        "model": "Illustrative preview — not a live API call",
        "disclaimer": (
            "This is a hand-written example of what a live Claude call would "
            "produce for this sample case, not a live model response. The "
            "risk score and findings above are computed entirely by the "
            "deterministic rule engine and statistical model, exactly as in "
            "a live-generated narrative. Advisory only; requires pathologist "
            "sign-off."
        ),
    }
