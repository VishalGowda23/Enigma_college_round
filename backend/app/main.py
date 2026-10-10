import os
from dotenv import load_dotenv

# Load local environment variables from .env file if present
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AgentBreak API",
    description="The Autonomous AI Red Team Testing Platform",
    version="1.0.0",
)

# Enable CORS for local frontend development (e.g. Vite on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.app.api.runs import router as runs_router

app.include_router(runs_router)

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Return health status and current execution mode."""
    mode = os.getenv("MODE", "deterministic")
    return {
        "status": "ok",
        "mode": mode,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
