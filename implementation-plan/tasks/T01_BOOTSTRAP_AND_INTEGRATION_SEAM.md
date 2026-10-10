# T01 — Bootstrap and Integration Seam

## 1. Objective
Build the application skeleton. Establish communication between the React frontend and FastAPI backend via a `/api/health` endpoint.

## 2. Requirements
- **Backend:** FastAPI app running locally.
- **Database:** SQLite initialized (using SQLAlchemy or raw sqlite3).
- **Frontend:** React + Vite app running locally.
- **Network:** Frontend can make an Axios/Fetch call to the Backend.

## 3. Implementation Steps
1.  **Backend:**
    - `mkdir backend && cd backend`
    - Create virtual environment and install `fastapi`, `uvicorn`, `pydantic`.
    - Write `app/main.py` with a simple `GET /api/health` route returning `{"status": "ok", "mode": "deterministic"}`.
    - Start server on port 8000.
2.  **Frontend:**
    - `npm create vite@latest frontend -- --template react-ts`
    - Install `axios` and `tailwindcss`.
    - Configure Tailwind.
    - Write a simple React component that fetches `/api/health` and displays the status on screen.
    - Start dev server on port 5173.

## 4. Acceptance Criteria
- [ ] Backend runs on `localhost:8000`.
- [ ] Frontend runs on `localhost:5173`.
- [ ] Opening the frontend in a browser displays "Backend Status: ok".

## 5. Contingency
If Vite/React setup fails or causes weird TypeScript errors, fall back to a plain HTML/JS file fetching the API to prove the seam works, then fix React later.
