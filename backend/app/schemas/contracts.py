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

class ExecutionMode(str, Enum):
    LIVE_MODEL = "live_model"
    DETERMINISTIC = "deterministic"
    REPLAY = "replay"
    FIXTURE = "fixture"

class ActorRole(str, Enum):
    HUNTER = "hunter"      # Offensive / Red team
    OPERATOR = "operator"  # Target agent
    SENTINEL = "sentinel"  # Defense / Policy
    ANALYST = "analyst"    # Evidence / Oracle
    SYSTEM = "system"      # Environment runtime

class RelationType(str, Enum):
    CAUSED_BY = "caused_by"
    READ_FROM = "read_from"
    REQUESTED_TOOL = "requested_tool"
    EVALUATED_BY = "evaluated_by"
    BLOCKED_BY = "blocked_by"
    EXECUTED_AS = "executed_as"
    VERIFIED_BY = "verified_by"
    FALLBACK_TO = "fallback_to"
    INFERRED = "inferred"

class EventType(str, Enum):
    RUN_STARTED = "RUN_STARTED"
    ENVIRONMENT_RESET = "ENVIRONMENT_RESET"
    RUN_COMPLETED = "RUN_COMPLETED"
    ATTEMPT_STARTED = "ATTEMPT_STARTED"
    ATTEMPT_FINISHED = "ATTEMPT_FINISHED"
    UNTRUSTED_CONTENT_READ = "UNTRUSTED_CONTENT_READ"
    MODEL_INVOCATION_STARTED = "MODEL_INVOCATION_STARTED"
    MODEL_INVOCATION_COMPLETED = "MODEL_INVOCATION_COMPLETED"
    MODEL_FALLBACK = "MODEL_FALLBACK"
    TOOL_CALL_ATTEMPTED = "TOOL_CALL_ATTEMPTED"
    POLICY_EVALUATED = "POLICY_EVALUATED"
    TOOL_CALL_EXECUTED = "TOOL_CALL_EXECUTED"
    TOOL_CALL_BLOCKED = "TOOL_CALL_BLOCKED"
    STATE_VERIFIED = "STATE_VERIFIED"
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
    execution_mode: ExecutionMode = ExecutionMode.DETERMINISTIC
    provider: Optional[str] = None
    model: Optional[str] = None
    last_event_id: Optional[str] = None
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
    tool_name: Optional[str] = None
    arguments: Optional[Dict[str, Any]] = None
    state_delta: Optional[Dict[str, Any]] = None

class EventPayload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str
    attempt_id: str
    parent_event_id: Optional[str] = None
    sequence_number: int = 1
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    event_type: EventType
    actor: Optional[str] = None
    source: str
    relation_type: Optional[str] = None
    execution_mode: ExecutionMode = ExecutionMode.DETERMINISTIC
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
