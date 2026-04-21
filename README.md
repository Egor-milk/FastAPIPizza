Simple Pizza POS (minimal)

Backend: FastAPI + SQLAlchemy (PostgreSQL)
Files:
- backend_app.py : FastAPI app
- database.py, models.py, crud.py, schemas.py : simple ORM and logic
- requirements.txt : Python deps

Frontend: frontend_index.html (React via CDN) — open in browser and point to backend (or run backend on same host).

Quick start:
1. Create a PostgreSQL database and set DATABASE_URL environment variable, example:
   export DATABASE_URL=postgresql://postgres:password@localhost:5432/pizza_db
2. Install deps: pip install -r requirements.txt
3. Run: python backend_app.py  (or uvicorn backend_app:app --reload)

This is a minimal, simple scaffold. Extend models, add auth, improve delivery routing and KDS as needed.
