This is a simple browser-based React frontend (Babel in-browser) created from frontend_index.html.

How to run locally:
- Option A: simple static server with Python (recommended):
  python -m http.server 3001
  then open http://localhost:3001/frontend_index.html

- Option B: use a static server like 'serve' or Vite (requires Node.js):
  npx serve -s . -l 3001

Notes:
- The frontend expects the backend at http://localhost:8000 (change API_BASE in api.js if different).
- This setup uses babel-standalone for quick development and is NOT optimized for production. For a proper React app, scaffold with Vite or CRA and install dependencies.