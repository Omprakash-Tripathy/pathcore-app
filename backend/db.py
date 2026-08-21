"""
db.py
Persistent audit trail for every analysis PathCore runs.

WHY THIS EXISTS: "Auditable" is one of the four AI Vision pillars in
the strategy deck (Slide 7) -- a real clinical decision-support tool
must keep a durable, queryable record of every analysis it produced,
independent of any single browser session. That's a genuine reason
to need a backend at all: this is state that has to live somewhere
that outlives a single request, which a purely client-side app
structurally cannot provide.

Uses Python's built-in sqlite3 -- no extra dependency, single file on
disk. NOTE: on some free hosting tiers the filesystem resets on each
new deploy (not on every request) -- fine for a demo/prototype, but a
production deployment would use a managed database with real backups.
"""

import sqlite3
import os
import json
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "pathcore.db")


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = _connect()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'single',
            age REAL,
            sex TEXT,
            biomarkers_json TEXT,
            impression_text TEXT,
            risk_score INTEGER,
            recommendation TEXT,
            ml_probability REAL
        )
    """)
    conn.commit()
    conn.close()


def insert_analysis(age, sex, biomarkers, impression_text,
                     risk_score, recommendation, ml_probability, source="single"):
    conn = _connect()
    cur = conn.execute(
        """INSERT INTO analyses
           (created_at, source, age, sex, biomarkers_json, impression_text,
            risk_score, recommendation, ml_probability)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            datetime.now(timezone.utc).isoformat(timespec="seconds"),
            source, age, sex, json.dumps(biomarkers), impression_text,
            risk_score, recommendation, ml_probability,
        ),
    )
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return new_id


def get_history(limit=100, tier=None):
    conn = _connect()
    query = "SELECT * FROM analyses"
    params = ()
    if tier:
        query += " WHERE recommendation = ?"
        params = (tier,)
    query += " ORDER BY id DESC LIMIT ?"
    params = params + (limit,)
    rows = conn.execute(query, params).fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "created_at": r["created_at"],
            "source": r["source"],
            "age": r["age"],
            "sex": r["sex"],
            "biomarkers": json.loads(r["biomarkers_json"]) if r["biomarkers_json"] else {},
            "impression_text": r["impression_text"],
            "risk_score": r["risk_score"],
            "recommendation": r["recommendation"],
            "ml_probability": r["ml_probability"],
        }
        for r in rows
    ]


def get_summary():
    conn = _connect()
    row = conn.execute("""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN recommendation = 'APPROVE' THEN 1 ELSE 0 END) AS approve_count,
            SUM(CASE WHEN recommendation = 'REVIEW' THEN 1 ELSE 0 END) AS review_count,
            SUM(CASE WHEN recommendation = 'ESCALATE' THEN 1 ELSE 0 END) AS escalate_count
        FROM analyses
    """).fetchone()
    conn.close()
    return {
        "total": row["total"] or 0,
        "approve_count": row["approve_count"] or 0,
        "review_count": row["review_count"] or 0,
        "escalate_count": row["escalate_count"] or 0,
    }
