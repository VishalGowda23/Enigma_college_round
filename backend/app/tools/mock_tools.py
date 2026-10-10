"""Mock tool implementations and mock environment state (T02)."""
from typing import Dict, List, Optional, Any
from backend.app.schemas.contracts import (
    CustomerRecord,
    Ticket,
    EmailRecord,
    ToolResult,
    RunContext,
    EventPayload,
    EventType,
    PolicyDecision,
)
from backend.app.data.fixtures import get_fixtures
from backend.app.policy.policy_engine import PolicyEngine

class MockEnvironment:
    def __init__(self):
        self.customers: Dict[str, CustomerRecord] = {}
        self.tickets: Dict[str, Ticket] = {}
        self.mock_outbox: List[EmailRecord] = []
        self.events: List[EventPayload] = []
        self._seq = 1
        self.reset()

    def reset(self):
        """Reset mock environment state to initial fixtures."""
        custs, ticks = get_fixtures()
        self.customers = custs
        self.tickets = ticks
        self.mock_outbox.clear()
        self.events.clear()
        self._seq = 1

    def emit_event(
        self,
        event_type: EventType,
        context: RunContext,
        source: str,
        tool_name: Optional[str] = None,
        arguments_json: Optional[Dict[str, Any]] = None,
        policy_decision: Optional[str] = None,
        reason_code: Optional[str] = None,
        evidence_json: Optional[Dict[str, Any]] = None,
        message: Optional[str] = None,
    ) -> EventPayload:
        payload = EventPayload(
            run_id=context.run_id,
            attempt_id=context.attempt_id,
            sequence_number=self._seq,
            event_type=event_type,
            source=source,
            tool_name=tool_name,
            arguments_json=arguments_json,
            policy_decision=policy_decision,
            reason_code=reason_code,
            evidence_json=evidence_json,
            message=message,
        )
        self._seq += 1
        self.events.append(payload)
        return payload

class MockToolAdapter:
    def __init__(self, env: MockEnvironment, policy_engine: Optional[PolicyEngine] = None):
        self.env = env
        self.policy_engine = policy_engine or PolicyEngine(defense_enabled=False)

    def read_ticket(self, ticket_id: str, context: RunContext) -> Optional[Ticket]:
        """Read a customer ticket (untrusted content source)."""
        ticket = self.env.tickets.get(ticket_id)
        if ticket:
            self.env.emit_event(
                event_type=EventType.UNTRUSTED_CONTENT_READ,
                context=context,
                source="mock_tools.read_ticket",
                tool_name="read_ticket",
                arguments_json={"ticket_id": ticket_id},
                evidence_json={"is_malicious": ticket.is_malicious, "subject": ticket.subject},
                message=f"Agent read ticket '{ticket_id}' with subject: '{ticket.subject}'",
            )
        return ticket

    def lookup_customer(self, customer_id: str, context: RunContext) -> Optional[CustomerRecord]:
        """Look up internal customer record containing billing info and account secrets."""
        cust = self.env.customers.get(customer_id)
        if cust:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_EXECUTED,
                context=context,
                source="mock_tools.lookup_customer",
                tool_name="lookup_customer",
                arguments_json={"customer_id": customer_id},
                evidence_json={"customer_id": cust.id, "tier": cust.tier},
                message=f"Lookup customer '{customer_id}' succeeded",
            )
        return cust

    def send_email(self, recipient: str, content: str, context: RunContext) -> ToolResult:
        """Attempt to send an email. Intercepted by PolicyEngine before mutating mock_outbox."""
        # 1. Emit TOOL_CALL_ATTEMPTED
        self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="send_email",
            arguments_json={"recipient": recipient, "content": content},
            message=f"Agent requested send_email to recipient '{recipient}'",
        )

        # 2. Evaluate Policy
        policy_result = self.policy_engine.evaluate(
            tool_name="send_email",
            args={"recipient": recipient, "content": content},
            context=context,
        )

        # 3. Emit POLICY_EVALUATED
        self.env.emit_event(
            event_type=EventType.POLICY_EVALUATED,
            context=context,
            source="policy_engine",
            tool_name="send_email",
            arguments_json={"recipient": recipient},
            policy_decision=policy_result.decision.value,
            reason_code=policy_result.reason_code.value,
            message=policy_result.message,
        )

        # 4. If DENIED -> Emit TOOL_CALL_BLOCKED, return Error without mutating outbox
        if not policy_result.is_allowed:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_BLOCKED,
                context=context,
                source="policy_engine",
                tool_name="send_email",
                arguments_json={"recipient": recipient},
                policy_decision=PolicyDecision.DENIED.value,
                reason_code=policy_result.reason_code.value,
                evidence_json={"state_mutated": False},
                message=f"BLOCKED: {policy_result.message}",
            )
            return ToolResult(
                success=False,
                output=None,
                error=policy_result.message,
                blocked=True,
                reason_code=policy_result.reason_code.value,
            )

        # 5. If ALLOWED -> Mutate Mock State, Emit TOOL_CALL_EXECUTED
        email = EmailRecord(
            run_id=context.run_id,
            attempt_id=context.attempt_id,
            recipient=recipient,
            content=content,
        )
        self.env.mock_outbox.append(email)

        self.env.emit_event(
            event_type=EventType.TOOL_CALL_EXECUTED,
            context=context,
            source="mock_tools.send_email",
            tool_name="send_email",
            arguments_json={"recipient": recipient},
            policy_decision=PolicyDecision.ALLOWED.value,
            reason_code=policy_result.reason_code.value,
            evidence_json={"outbox_id": email.id, "state_mutated": True},
            message=f"Email committed to mock_outbox (ID: {email.id})",
        )

        return ToolResult(
            success=True,
            output=f"Email sent successfully to {recipient}",
            blocked=False,
            reason_code=policy_result.reason_code.value,
        )
