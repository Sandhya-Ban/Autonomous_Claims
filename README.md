# Autonomous Insurance Claims Processing Agent (FNOL)

## Problem Statement
Build a lightweight agent that:
- Extracts key fields from FNOL (First Notice of Loss) documents
- Identifies missing or inconsistent fields
- Classifies the claim and routes it to the correct workflow
- Provides a short explanation for the routing decision

---

## Project Structure
synapx-fnol-agent/
- backend/
  - src/
    - __init__.py
    - api.py
    - extractor.py
    - main.py
    - router.py
    - schemas.py
    - validator.py
  - data/
  - outputs/
  - requirements.txt
- frontend/
  - src/
    - api.js
    - App.jsx
    - main.jsx
    - index.css
  - index.html
  - package.json
  - vite.config.js
  - tailwind.config.js
  - postcss.config.js
- .gitignore
- README.md

---

## Fields to Extract
### Policy Information
- Policy Number
- Policyholder Name
- Effective Dates

### Incident Information
- Date
- Time
- Location
- Description

### Involved Parties
- Claimant
- Third Parties
- Contact Details

### Asset Details
- Asset Type
- Asset ID
- Estimated Damage

### Other Mandatory Fields
- Claim Type
- Attachments
- Initial Estimate

---

## Routing Rules Implemented (Priority Order)
1. Investigation Flag  
   - If description contains: fraud / inconsistent / staged

2. Specialist Queue  
   - If claim type = injury

3. Manual review  
   - If any mandatory field is missing  
   - If inconsistencies are detected

4. Fast-track  
   - If estimated damage < 25,000

5. Standard queue  
   - Default if none of the above rules match

---

## Output Format (JSON)
{
  "extractedFields": {},
  "missingFields": [],
  "recommendedRoute": "",
  "reasoning": ""
}

---

## Backend Setup (FastAPI)

1) Go to backend folder
cd backend

2) Create virtual environment
python -m venv venv

3) Activate venv (Windows)
venv\Scripts\activate

4) Install backend dependencies
python -m pip install -r requirements.txt

5) Run backend API server
python -m uvicorn src.api:app --reload

Swagger UI:
http://127.0.0.1:8000/docs

---

## Frontend Setup (React + Vite + Tailwind)

1) Go to frontend folder
cd frontend

2) Install dependencies
npm install

3) Run frontend
npm run dev

Frontend URL:
http://localhost:5173

---

## How to Test
1. Start backend server
2. Start frontend server
3. Upload a FNOL document (.txt or .pdf) from the UI
4. Verify extracted fields, missing fields, recommended route, and reasoning
