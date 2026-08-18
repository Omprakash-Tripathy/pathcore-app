"""
nlp_parser.py
Locally-hosted NLP engine for parsing free-text lab impressions.

Design choice: a curated critical-term lexicon plus simple negation
detection, rather than a large downloaded language model. This keeps
the engine (a) fully on-premise / zero external API calls, matching
the project's DPDP Act positioning, and (b) fully explainable — every
flag traces back to a literal phrase in the text, never an opaque
model score. This is the "rule engine, not black box" design choice
argued for on Slide 5 of the strategy deck.

A production version would likely upgrade this to a fine-tuned
clinical NLP model (e.g. built on spaCy) trained on de-identified
historical impressions, still run entirely on internal servers.
"""

import re

# (phrase, severity) -- severity contributes to the risk score.
# "critical" phrases point to findings that should never be missed.
# "moderate" phrases point to findings that warrant a closer look.
CRITICAL_PHRASES = [
    "malignant", "malignancy", "carcinoma", "suspicious for carcinoma",
    "acute leukemia", "blast cells", "hemorrhage", "sepsis",
    "life-threatening", "critical value", "panic value",
]

MODERATE_PHRASES = [
    "atypical cells", "inflammation", "infection", "anemia",
    "mild deviation", "borderline", "recommend correlation",
    "recommend follow-up", "indeterminate",
]

# Negation cues that, if found shortly before a phrase, flip it off.
NEGATION_CUES = [
    "no evidence of", "no signs of", "negative for", "rule out",
    "not suggestive of", "without evidence of", "no ", "not ",
]


def _is_negated(text, phrase_start_idx, window=40):
    """Look at the text immediately before the phrase for a negation cue."""
    window_text = text[max(0, phrase_start_idx - window):phrase_start_idx].lower()
    return any(cue in window_text for cue in NEGATION_CUES)


def parse_impression(text):
    """
    Scans free-text lab impression for critical/moderate phrases.
    Returns a list of flag dicts, each with the matched phrase,
    severity, and whether it was negated (and therefore excluded).
    """
    if not text:
        return []

    lower_text = text.lower()
    flags = []

    for phrase in CRITICAL_PHRASES:
        for match in re.finditer(re.escape(phrase), lower_text):
            negated = _is_negated(lower_text, match.start())
            flags.append({
                "phrase": phrase,
                "severity": "critical",
                "negated": negated,
                "rule_trace": (
                    f"Matched critical term '{phrase}' in impression text."
                    + (" Preceded by a negation cue — excluded from scoring."
                       if negated else " No negation cue found — flagged.")
                ),
            })

    for phrase in MODERATE_PHRASES:
        for match in re.finditer(re.escape(phrase), lower_text):
            negated = _is_negated(lower_text, match.start())
            flags.append({
                "phrase": phrase,
                "severity": "moderate",
                "negated": negated,
                "rule_trace": (
                    f"Matched moderate-concern term '{phrase}' in impression text."
                    + (" Preceded by a negation cue — excluded from scoring."
                       if negated else " No negation cue found — flagged.")
                ),
            })

    return flags


def nlp_severity_score(flags):
    """
    Converts active (non-negated) NLP flags into a 0-4 sub-score
    contributing to the overall 1-10 risk score.
    """
    active = [f for f in flags if not f["negated"]]
    if not active:
        return 0

    if any(f["severity"] == "critical" for f in active):
        return 4
    return 2
