"""Core contracts, enums, and dataclasses for AgentBreak.
Frozen according to implementation-plan/02_ARCHITECTURE_AND_CONTRACTS.md.
"""
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone

class AttemptOutcome(str, Enum):
    CONFIRMED_EXPLOIT = "CONFIRMED_EXPLOIT"
    BLOCKED = "BLOCKED"
    NO_EXPLOIT_OBSERVED = "NO_EXPLOIT_OBSERVED"
    ERROR = "ERROR"
    INCONCLUSIVE = "INCONCLUSIVE"

class EventType(str, Enum):
    RUN_STARTED = "RUN_STARTED"
    ENVIRONMENT_RESET = "ENVIRONMENT_RESET"
    RUN_COMPLETED = "RUN_COMPLETED"
    ATTEMPT_STARTED = "ATTEMPT_STARTED"
    ATTEMPT_FINISHED = "ATTEMPT_FINISHED"
    UNTRUSTED_CONTENT_READ = "UNTRUSTED_CONTENT_READ"
    TOOL_CALL_ATTEMPTED = "TOOL_CALL_ATTEMPTED"
    POLICY_EVALUATED = "POLICY_EVALUATED"
    TOOL_CALL_EXECUTED = "TOOL_CALL_EXECUTED"
    TOOL_CALL_BLOCKED = "TOOL_CALL_BLOCKED"
    ORACLE_VERDICT = "ORACLE_VERDICT"

class PolicyDecision(str, Enum):
    ALLOWED = "ALLOWED"
    DENIED = "DENIED"

class ReasonCode(str, Enum):
    ALLOWLIST_MATCH = "ALLOWLIST_MATCH"
    UNAUTHORIZED_RECIPIENT = "UNAUTHORIZED_RECIPIENT"
    DATA_EXFILTRATION_DETECTED = "DATA_EXFILTRATION_DETECTED"
    NO_POLICY_APPLIED = "NO_POLICY_APPLIED"

class RunContext(BaseModel):
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    attempt_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    defense_enabled: bool = False
    scenario_id: str = "support-ticket-injection"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EmailRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str
    attempt_id: str
    recipient: str
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ToolResult(BaseModel):
    success: bool
    output: Any
    error: Optional[str] = None
    blocked: bool = False
    reason_code: Optional[str] = None

class EventPayload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str
    attempt_id: str
    sequence_number: int = 1
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event_type: EventType
    source: str
    tool_name: Optional[str] = None
    arguments_json: Optional[Dict[str, Any]] = None
    policy_decision: Optional[str] = None
    reason_code: Optional[str] = None
    evidence_json: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

class CustomerRecord(BaseModel):
    id: str
    name: str
    billing_email: str
    account_secret: str
    tier: str

class Ticket(BaseModel):
    id: str
    customer_id: str
    subject: str
    body: str
    is_malicious: bool = False
    expected_exfiltration_recipient: Optional[str] = None
