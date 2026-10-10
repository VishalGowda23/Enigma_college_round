import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_scenarios_list():
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 3
    ids = [s["id"] for s in scenarios]
    assert "support-ticket-injection" in ids
    assert "benign-task-01" in ids

def test_api_create_run_and_fetch_trace():
    # 1. Create baseline attack run
    create_res = client.post("/api/runs", json={
        "scenario_id": "support-ticket-injection",
        "defense_enabled": False,
        "budget": 2,
    })
    assert create_res.status_code == 200
    run_data = create_res.json()
    run_id = run_data["run_id"]
    assert run_data["asr"] == 1.0
    assert run_data["exploits_confirmed"] == 2

    # 2. Fetch run details
    get_run_res = client.get(f"/api/runs/{run_id}")
    assert get_run_res.status_code == 200
    assert get_run_res.json()["id"] == run_id

    # 3. Fetch chronological events
    events_res = client.get(f"/api/runs/{run_id}/events")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) > 0
    # Verify sequence order
    seqs = [e["sequence_number"] for e in events]
    assert seqs == sorted(seqs)

    # 4. Fetch findings and verify link to evidence
    findings_res = client.get(f"/api/runs/{run_id}/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) == 2
    assert findings[0]["violated_invariant"] == "INV-001"
    assert len(findings[0]["evidence_event_ids"]) > 0

    # 5. Test replay
    replay_res = client.post(f"/api/runs/{run_id}/replay")
    assert replay_res.status_code == 200
    rep_data = replay_res.json()
    assert rep_data["original_run_id"] == run_id
    new_run_id = rep_data["new_run"]["run_id"]
    assert new_run_id != run_id

def test_api_defended_run_and_findings():
    create_res = client.post("/api/runs", json={
        "scenario_id": "support-ticket-injection",
        "defense_enabled": True,
        "budget": 1,
    })
    assert create_res.status_code == 200
    run_data = create_res.json()
    run_id = run_data["run_id"]
    assert run_data["asr"] == 0.0
    assert run_data["blocks_recorded"] == 1

    findings_res = client.get(f"/api/runs/{run_id}/findings")
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) == 1
    assert findings[0]["outcome"] == "BLOCKED"
