# 06 — Technology Stack and Engineering Setup

## 1. Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast local UI development and type-checked contracts |
| Styling | Tailwind CSS | Rapid consistent layout |
| Backend | Python + FastAPI | Clear REST APIs and convenient testing of security/orchestration logic |
| Persistence | SQLite | Zero server administration and easy local run history |
| Data validation | Pydantic models | Typed request/response schemas |
| Testing | pytest + HTTP client tests | Efficient verification of policy, oracle, and API behavior |
| Frontend tests | Vitest and optional React Testing Library | Basic component/state verification if time allows |
| Charts | Recharts or simple native components | Enough for a small metrics dashboard |
| Model access | Optional provider adapter | Avoids binding the product to one model API |
| Version control | Git and GitHub | Parallel work and checkpoints |

## 2. Default dependency philosophy

- Add dependencies only if they reduce development time or satisfy a requirement.
- Keep the model provider SDK behind one adapter.
- Do not add a vector database for the canonical scenario; a local fixture or SQLite table is enough.
- Do not introduce a complex agent framework unless it significantly accelerates the build and remains easy to inspect.
- Avoid requiring a GPU.
- Pin or lock dependency versions when the repository is initialized.

## 3. Suggested repository layout

```text
agentbreak/
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml          # optional, only if needed
├── backend/
│   ├── pyproject.toml          # or requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── agent/
│   │   ├── attacks/
│   │   ├── tools/
│   │   ├── oracle/
│   │   ├── trace/
│   │   ├── storage/
│   │   └── schemas/
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── styles/
├── data/
│   └── scenarios/
└── docs/
```

This is a starting layout, not a demand to create every folder before code exists.

## 4. Configuration

Provide `.env.example` with non-secret settings and optional provider-key placeholder. Never commit `.env` or actual keys. Suggested settings:

- `AGENTBREAK_DB_PATH=./data/agentbreak.sqlite3`
- `AGENTBREAK_MAX_ATTEMPTS=10`
- `AGENTBREAK_MODEL_MODE=deterministic`
- `AGENTBREAK_MODEL_PROVIDER=`
- `AGENTBREAK_MODEL_API_KEY=`
- `AGENTBREAK_REQUEST_TIMEOUT_SECONDS=20`

Names can change in implementation, but their meaning should remain documented. Secrets must be handled by the environment, not the database or trace file.

## 5. Local startup contract

The final repository should offer a short, tested setup sequence:

1. Install backend dependencies.
2. Create local environment from `.env.example` if needed.
3. Initialize database/schema.
4. Start FastAPI.
5. Install frontend dependencies.
6. Start Vite.
7. Open the local dashboard and run the built-in demo.

The actual commands belong in the code repository's README and must be tested on the machine used for the demo.

## 6. Optional model adapter contract

The interface should accept a prompt/task plus explicitly approved context and return a structured response or tool-request object. It must have:
- bounded timeout;
- bounded retry count;
- provider/model identifier recorded in run configuration;
- no access to raw secrets;
- no direct tool side effects;
- clean fallback or error state.

Do not let model output specify an arbitrary Python callable, shell command, URL to fetch, or unregistered tool.

## 7. Why not a heavier stack?

The demo is a local security lab with a small synthetic dataset. Adding cloud services, message queues, external databases, multi-agent frameworks, or vector stores adds installation and integration failure modes without being necessary to demonstrate the required core workflow.
