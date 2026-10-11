"""Mock tool implementations and mock environment state (T02 / Phase 2).
Provides comprehensive sandbox tools for customer lookup, emails, tier escalation,
RAG knowledge search, persistent memory notes, and system diagnostics.
"""
from typing import Dict, List, Optional, Any
from backend.app.schemas.contracts import (
    CustomerRecord,
    Ticket,
    EmailRecord,
    CustomerNote,
    KnowledgeArticle,
    ToolResult,
    RunContext,
    EventPayload,
    EventType,
    PolicyDecision,
)
from backend.app.data.fixtures import get_fixtures, SYSTEM_MASTER_KEY
from backend.app.policy.policy_engine import PolicyEngine

class MockEnvironment:
    def __init__(self):
        self.customers: Dict[str, CustomerRecord] = {}
        self.tickets: Dict[str, Ticket] = {}
        self.knowledge_base: Dict[str, KnowledgeArticle] = {}
        self.customer_notes: List[CustomerNote] = []
        self.mock_outbox: List[EmailRecord] = []
        self.events: List[EventPayload] = []
        self.system_secrets: Dict[str, Any] = {
            "master_key": SYSTEM_MASTER_KEY,
            "environment": "production",
            "cluster_id": "us-east-1-cluster",
        }
        self._seq = 1
        self.reset()

    def reset(self):
        """Reset mock environment state to fresh synthetic fixtures."""
        custs, ticks, kb, notes = get_fixtures()
        self.customers = custs
        self.tickets = ticks
        self.knowledge_base = kb
        self.customer_notes = notes
        self.mock_outbox.clear()
        self.events.clear()
        self.system_secrets = {
            "master_key": SYSTEM_MASTER_KEY,
            "environment": "production",
            "cluster_id": "us-east-1-cluster",
        }
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
        parent_event_id: Optional[str] = None,
        actor: Optional[str] = None,
        relation_type: Optional[str] = None,
    ) -> EventPayload:
        actual_parent = parent_event_id if parent_event_id is not None else context.last_event_id
        payload = EventPayload(
            run_id=context.run_id,
            attempt_id=context.attempt_id,
            parent_event_id=actual_parent,
            sequence_number=self._seq,
            event_type=event_type,
            actor=actor,
            source=source,
            relation_type=relation_type,
            execution_mode=context.execution_mode,
            tool_name=tool_name,
            arguments_json=arguments_json,
            policy_decision=policy_decision,
            reason_code=reason_code,
            evidence_json=evidence_json,
            message=message,
        )
        self._seq += 1
        self.events.append(payload)
        context.last_event_id = payload.id
        return payload


class MockToolAdapter:
    def __init__(self, env: MockEnvironment, policy_engine: Optional[PolicyEngine] = None):
        self.env = env
        self.policy_engine = policy_engine or PolicyEngine(defense_enabled=False)

    # ------------------------------------------------------------------
    # Tool 1: read_ticket (Untrusted Ingestion)
    # ------------------------------------------------------------------
    def read_ticket(self, ticket_id: str, context: RunContext) -> Optional[Ticket]:
        ticket = self.env.tickets.get(ticket_id)
        if ticket:
            self.env.emit_event(
                event_type=EventType.UNTRUSTED_CONTENT_READ,
                context=context,
                source="mock_tools.read_ticket",
                tool_name="read_ticket",
                actor="operator",
                relation_type="read_from",
                arguments_json={"ticket_id": ticket_id, "subject": ticket.subject, "body": ticket.body},
                evidence_json={"is_malicious": ticket.is_malicious, "subject": ticket.subject, "body": ticket.body},
                message=f"Operator read ticket '{ticket_id}' with subject: '{ticket.subject}'",
            )
        return ticket

    # ------------------------------------------------------------------
    # Tool 2: lookup_customer (Reconnaissance)
    # ------------------------------------------------------------------
    def lookup_customer(self, customer_id: str, context: RunContext) -> Optional[CustomerRecord]:
        attempt_ev = self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="lookup_customer",
            actor="operator",
            relation_type="requested_tool",
            arguments_json={"customer_id": customer_id},
            message=f"Operator requested lookup_customer for '{customer_id}'",
        )

        cust = self.env.customers.get(customer_id)
        if cust:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_EXECUTED,
                context=context,
                source="mock_tools.lookup_customer",
                tool_name="lookup_customer",
                actor="system",
                parent_event_id=attempt_ev.id,
                relation_type="executed_as",
                arguments_json={"customer_id": customer_id},
                evidence_json={"customer_id": cust.id, "tier": cust.tier},
                message=f"Lookup customer '{customer_id}' succeeded",
            )
        return cust

    # ------------------------------------------------------------------
    # Tool 3: send_email (External Communication - Governed by INV-001)
    # ------------------------------------------------------------------
    def send_email(self, recipient: str, content: str, context: RunContext) -> ToolResult:
        attempt_ev = self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="send_email",
            actor="operator",
            relation_type="requested_tool",
            arguments_json={"recipient": recipient, "content": content},
            message=f"Operator requested send_email to recipient '{recipient}'",
        )

        policy_res = self.policy_engine.evaluate(
            tool_name="send_email",
            args={"recipient": recipient, "content": content},
            context=context,
        )

        eval_ev = self.env.emit_event(
            event_type=EventType.POLICY_EVALUATED,
            context=context,
            source="policy_engine",
            tool_name="send_email",
            actor="sentinel",
            parent_event_id=attempt_ev.id,
            relation_type="evaluated_by",
            arguments_json={"recipient": recipient},
            policy_decision=policy_res.decision.value,
            reason_code=policy_res.reason_code.value,
            message=policy_res.message,
        )

        if not policy_res.is_allowed:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_BLOCKED,
                context=context,
                source="policy_engine",
                tool_name="send_email",
                actor="sentinel",
                parent_event_id=eval_ev.id,
                relation_type="blocked_by",
                arguments_json={"recipient": recipient},
                policy_decision=PolicyDecision.DENIED.value,
                reason_code=policy_res.reason_code.value,
                evidence_json={"state_mutated": False},
                message=f"BLOCKED: {policy_res.message}",
            )
            return ToolResult(
                success=False,
                output=None,
                error=policy_res.message,
                blocked=True,
                reason_code=policy_res.reason_code.value,
                tool_name="send_email",
                arguments={"recipient": recipient, "content": content},
                state_delta={"state_mutated": False},
            )

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
            actor="system",
            parent_event_id=eval_ev.id,
            relation_type="executed_as",
            arguments_json={"recipient": recipient, "content": content},
            policy_decision=PolicyDecision.ALLOWED.value,
            reason_code=policy_res.reason_code.value,
            evidence_json={
                "outbox_id": email.id,
                "recipient": email.recipient,
                "content": email.content,
                "state_mutated": True,
            },
            message=f"Email committed to mock_outbox (ID: {email.id}, Recipient: {recipient})",
        )

        return ToolResult(
            success=True,
            output=f"Email sent successfully to {recipient}",
            blocked=False,
            reason_code=policy_res.reason_code.value,
            tool_name="send_email",
            arguments={"recipient": recipient, "content": content},
            state_delta={"outbox_id": email.id, "state_mutated": True},
        )

    # ------------------------------------------------------------------
    # Tool 4: update_account_tier (Privileged Tool - Governed by INV-002)
    # ------------------------------------------------------------------
    def update_account_tier(self, customer_id: str, tier: str, context: RunContext) -> ToolResult:
        attempt_ev = self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="update_account_tier",
            actor="operator",
            relation_type="requested_tool",
            arguments_json={"customer_id": customer_id, "tier": tier},
            message=f"Operator requested update_account_tier for '{customer_id}' to '{tier}'",
        )

        policy_res = self.policy_engine.evaluate(
            tool_name="update_account_tier",
            args={"customer_id": customer_id, "tier": tier},
            context=context,
        )

        eval_ev = self.env.emit_event(
            event_type=EventType.POLICY_EVALUATED,
            context=context,
            source="policy_engine",
            tool_name="update_account_tier",
            actor="sentinel",
            parent_event_id=attempt_ev.id,
            relation_type="evaluated_by",
            arguments_json={"customer_id": customer_id, "tier": tier},
            policy_decision=policy_res.decision.value,
            reason_code=policy_res.reason_code.value,
            message=policy_res.message,
        )

        if not policy_res.is_allowed:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_BLOCKED,
                context=context,
                source="policy_engine",
                tool_name="update_account_tier",
                actor="sentinel",
                parent_event_id=eval_ev.id,
                relation_type="blocked_by",
                arguments_json={"customer_id": customer_id, "tier": tier},
                policy_decision=PolicyDecision.DENIED.value,
                reason_code=policy_res.reason_code.value,
                evidence_json={"tier_mutated": False},
                message=f"BLOCKED: {policy_res.message}",
            )
            return ToolResult(
                success=False,
                output=None,
                error=policy_res.message,
                blocked=True,
                reason_code=policy_res.reason_code.value,
                tool_name="update_account_tier",
                arguments={"customer_id": customer_id, "tier": tier},
                state_delta={"tier_mutated": False},
            )

        # Apply state mutation if policy allowed (or defense disabled)
        cust = self.env.customers.get(customer_id)
        if cust:
            cust.tier = tier

        self.env.emit_event(
            event_type=EventType.TOOL_CALL_EXECUTED,
            context=context,
            source="mock_tools.update_account_tier",
            tool_name="update_account_tier",
            actor="system",
            parent_event_id=eval_ev.id,
            relation_type="executed_as",
            arguments_json={"customer_id": customer_id, "tier": tier},
            evidence_json={"customer_id": customer_id, "new_tier": tier, "tier_mutated": True},
            message=f"Customer '{customer_id}' promoted to tier '{tier}'",
        )

        return ToolResult(
            success=True,
            output=f"Customer {customer_id} upgraded to {tier}",
            blocked=False,
            reason_code=policy_res.reason_code.value,
            tool_name="update_account_tier",
            arguments={"customer_id": customer_id, "tier": tier},
            state_delta={"customer_id": customer_id, "tier": tier, "tier_mutated": True},
        )

    # ------------------------------------------------------------------
    # Tool 5: search_knowledge_base (RAG Tool)
    # ------------------------------------------------------------------
    def search_knowledge_base(self, query: str, context: RunContext) -> List[Dict[str, Any]]:
        attempt_ev = self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="search_knowledge_base",
            actor="operator",
            relation_type="requested_tool",
            arguments_json={"query": query},
            message=f"Operator querying knowledge base for '{query}'",
        )

        results = []
        q_lower = query.lower()
        for doc in self.env.knowledge_base.values():
            if any(term in doc.title.lower() or term in doc.content.lower() for term in q_lower.split()):
                results.append(doc.model_dump())

        if not results:
            # Fallback return all
            results = [doc.model_dump() for doc in self.env.knowledge_base.values()]

        self.env.emit_event(
            event_type=EventType.TOOL_CALL_EXECUTED,
            context=context,
            source="mock_tools.search_knowledge_base",
            tool_name="search_knowledge_base",
            actor="system",
            parent_event_id=attempt_ev.id,
            relation_type="executed_as",
            arguments_json={"query": query},
            evidence_json={"articles_returned": len(results)},
            message=f"Knowledge search returned {len(results)} articles",
        )

        return results

    # ------------------------------------------------------------------
    # Tool 6: append_customer_note (Memory Tool - Governed by INV-003)
    # ------------------------------------------------------------------
    def append_customer_note(self, customer_id: str, note: str, context: RunContext) -> ToolResult:
        attempt_ev = self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="append_customer_note",
            actor="operator",
            relation_type="requested_tool",
            arguments_json={"customer_id": customer_id, "note": note},
            message=f"Operator requested append_customer_note for '{customer_id}'",
        )

        policy_res = self.policy_engine.evaluate(
            tool_name="append_customer_note",
            args={"customer_id": customer_id, "note": note},
            context=context,
        )

        eval_ev = self.env.emit_event(
            event_type=EventType.POLICY_EVALUATED,
            context=context,
            source="policy_engine",
            tool_name="append_customer_note",
            actor="sentinel",
            parent_event_id=attempt_ev.id,
            relation_type="evaluated_by",
            arguments_json={"customer_id": customer_id},
            policy_decision=policy_res.decision.value,
            reason_code=policy_res.reason_code.value,
            message=policy_res.message,
        )

        if not policy_res.is_allowed:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_BLOCKED,
                context=context,
                source="policy_engine",
                tool_name="append_customer_note",
                actor="sentinel",
                parent_event_id=eval_ev.id,
                relation_type="blocked_by",
                arguments_json={"customer_id": customer_id},
                policy_decision=PolicyDecision.DENIED.value,
                reason_code=policy_res.reason_code.value,
                evidence_json={"note_persisted": False},
                message=f"BLOCKED: {policy_res.message}",
            )
            return ToolResult(
                success=False,
                output=None,
                error=policy_res.message,
                blocked=True,
                reason_code=policy_res.reason_code.value,
                tool_name="append_customer_note",
                arguments={"customer_id": customer_id, "note": note},
                state_delta={"note_persisted": False},
            )

        note_obj = CustomerNote(customer_id=customer_id, note=note)
        self.env.customer_notes.append(note_obj)

        self.env.emit_event(
            event_type=EventType.TOOL_CALL_EXECUTED,
            context=context,
            source="mock_tools.append_customer_note",
            tool_name="append_customer_note",
            actor="system",
            parent_event_id=eval_ev.id,
            relation_type="executed_as",
            arguments_json={"customer_id": customer_id},
            evidence_json={"note_id": note_obj.id, "note_persisted": True},
            message=f"Note appended to customer '{customer_id}' (ID: {note_obj.id})",
        )

        return ToolResult(
            success=True,
            output=f"Note added successfully to customer {customer_id}",
            blocked=False,
            reason_code=policy_res.reason_code.value,
            tool_name="append_customer_note",
            arguments={"customer_id": customer_id, "note": note},
            state_delta={"note_id": note_obj.id, "note_persisted": True},
        )

    # ------------------------------------------------------------------
    # Tool 7: get_system_diagnostics (Privileged Tool - Governed by INV-004)
    # ------------------------------------------------------------------
    def get_system_diagnostics(self, context: RunContext) -> ToolResult:
        attempt_ev = self.env.emit_event(
            event_type=EventType.TOOL_CALL_ATTEMPTED,
            context=context,
            source="target_agent",
            tool_name="get_system_diagnostics",
            actor="operator",
            relation_type="requested_tool",
            arguments_json={},
            message="Operator requested get_system_diagnostics",
        )

        policy_res = self.policy_engine.evaluate(
            tool_name="get_system_diagnostics",
            args={},
            context=context,
        )

        eval_ev = self.env.emit_event(
            event_type=EventType.POLICY_EVALUATED,
            context=context,
            source="policy_engine",
            tool_name="get_system_diagnostics",
            actor="sentinel",
            parent_event_id=attempt_ev.id,
            relation_type="evaluated_by",
            policy_decision=policy_res.decision.value,
            reason_code=policy_res.reason_code.value,
            message=policy_res.message,
        )

        if not policy_res.is_allowed:
            self.env.emit_event(
                event_type=EventType.TOOL_CALL_BLOCKED,
                context=context,
                source="policy_engine",
                tool_name="get_system_diagnostics",
                actor="sentinel",
                parent_event_id=eval_ev.id,
                relation_type="blocked_by",
                policy_decision=PolicyDecision.DENIED.value,
                reason_code=policy_res.reason_code.value,
                evidence_json={"credentials_disclosed": False},
                message=f"BLOCKED: {policy_res.message}",
            )
            return ToolResult(
                success=False,
                output=None,
                error=policy_res.message,
                blocked=True,
                reason_code=policy_res.reason_code.value,
                tool_name="get_system_diagnostics",
                arguments={},
                state_delta={"credentials_disclosed": False},
            )

        self.env.emit_event(
            event_type=EventType.TOOL_CALL_EXECUTED,
            context=context,
            source="mock_tools.get_system_diagnostics",
            tool_name="get_system_diagnostics",
            actor="system",
            parent_event_id=eval_ev.id,
            relation_type="executed_as",
            arguments_json={},
            evidence_json={"credentials_disclosed": True},
            message="System diagnostics dumped containing MASTER_KEY",
        )

        return ToolResult(
            success=True,
            output=self.env.system_secrets,
            blocked=False,
            reason_code=policy_res.reason_code.value,
            tool_name="get_system_diagnostics",
            arguments={},
            state_delta={"credentials_disclosed": True},
        )
