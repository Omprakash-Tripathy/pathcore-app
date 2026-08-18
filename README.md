# PathCore Prototype

AI-driven Report Accuracy & Physiological Deviation Flagging — a clinical
decision-support prototype built for the DTAI Capstone (Group 9, IIM
Lucknow) strategy for Dr. Lal PathLabs.

This folder contains the **verified, working source code**. It is meant
to be used together with the full build guide,
**"Building the PathCore Prototype — A Complete Beginner's Guide,"**
which walks through every step from installing tools through to a live,
deployed demo — this README is just a quick-reference, not a substitute
for that guide.

## Structure

```
pathcore-app/
├── backend/           Flask API — rule engine + NLP parser + risk scoring
│   ├── app.py
│   ├── rule_engine.py
│   ├── nlp_parser.py
│   ├── sample_cases.json
│   └── requirements.txt
└── frontend/           React + Tailwind UI
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## Quick start (if you already have Python + Node installed)

**Backend:**
```
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```
Runs on http://localhost:5000

**Frontend (in a second terminal):**
```
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

Open http://localhost:5173 in your browser, click a sample case button,
then click "Analyze Report."

## Important — this is a prototype

- Uses **synthetic data only**. Never point this at real patient data.
- The reference ranges in `rule_engine.py` are simplified, illustrative
  values for a student capstone — not clinically validated.
- The system is **advisory only** — it never auto-approves anything;
  every design choice assumes a human pathologist makes the final call.

See the full build guide for deployment steps (Render + Vercel), the
demo script, and a presentation-day checklist.
