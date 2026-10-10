# 01 — Stack and Repository Strategy

## 1. Technology Stack

This stack is selected for rapid development, local reproducibility, and strong typing.

| Layer | Technology | Justification |
|---|---|---|
| **Frontend UI** | React 18, TypeScript, Vite | Fast HMR, type safety, component reusability. |
| **UI Styling** | Tailwind CSS (via PostCSS) | Rapid layout without writing custom CSS classes. |
| **Backend API** | Python 3.11+, FastAPI | Native async, automatic OpenAPI docs, excellent for orchestration logic. |
| **Data Validation** | Pydantic v2 | Enforces strong schemas for API requests, responses, and event payloads. |
| **Persistence** | SQLite | Zero setup, single-file database. Perfect for local tracing and replay. |
| **ORM/Querying** | SQLAlchemy (Core or ORM) | Simplifies database interactions and schema management. |
| **Testing** | `pytest` | Fast, standard Python testing framework for core logic and APIs. |
| **State Mgt (UI)** | React Context / Hooks | Sufficient for the MVP; avoid Redux/Zustand overhead unless necessary. |
| **Charts/Graphs** | Native UI or Recharts | Simple visual representation of metrics. |

## 2. Dependency Philosophy

*   **Minimalism:** Only add a dependency if it saves significant time on the critical path.
*   **No heavy agent frameworks:** Avoid LangChain, AutoGen, or CrewAI unless they drastically simplify the synthetic agent implementation without obscuring the tool boundary. A simple custom orchestrator loop is often easier to debug.
*   **No vector databases:** Use local static fixtures or SQLite for the mock support tickets and customer data.

## 3. Repository Structure

The project will use a standard monorepo structure separating the frontend and backend.

```text
agentbreak/
├── README.md                 # Setup, run instructions, and demo script
├── .env.example              # Template for environment variables
├── .gitignore
├── backend/
│   ├── pyproject.toml        # or requirements.txt
│   ├── app/
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, db session, orchestrator
│   │   ├── agent/            # Synthetic target agent implementation
│   │   ├── attacks/          # Attack engine and mutation logic
│   │   ├── tools/            # Mock tool implementations & adapters
│   │   ├── policy/           # Defense evaluation logic
│   │   ├── oracle/           # Side-effect evaluation and verdicts
│   │   ├── trace/            # Event logging and metrics
│   │   ├── storage/          # SQLite models and repositories
│   │   └── schemas/          # Pydantic models (DTOs)
│   ├── tests/                # pytest suite
│   └── data/
│       └── fixtures/         # Synthetic tickets and customer data
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── api/              # Axios/fetch clients for FastAPI
        ├── components/       # Reusable UI components (buttons, cards)
        ├── pages/            # View components (Dashboard, Trace Detail)
        ├── types/            # TypeScript interfaces matching Pydantic
        └── utils/            # Formatting and helpers
```

## 4. Local Environment Configuration

The system must run locally using an `.env` file (copied from `.env.example`).

```env
# backend/.env.example
ENVIRONMENT=development
AGENTBREAK_DB_PATH=sqlite:///./agentbreak.db
AGENTBREAK_MAX_ATTEMPTS=10
AGENTBREAK_MODEL_MODE=deterministic  # Options: deterministic, model-assisted
AGENTBREAK_MODEL_PROVIDER=openai     # Optional: openai, anthropic
AGENTBREAK_MODEL_API_KEY=            # Optional: leave blank for deterministic
```

## 5. Startup Contract

The README must define a single, reliable startup sequence:

1.  **Backend:** `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
2.  **Frontend:** `cd frontend && npm install && npm run dev`
3.  **Access:** Open `http://localhost:5173` in the browser.

*(Note: In Google Antigravity, we may use standard terminal commands or shell scripts to automate this).*
