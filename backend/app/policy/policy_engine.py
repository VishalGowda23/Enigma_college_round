"""Policy Engine for Tool-Boundary Enforcement (T03).
Enforces security invariant INV-001 before tool side effects commit.
"""
from typing import Dict, Any, List
from backend.app.schemas.contracts import (
    PolicyDecision,
    ReasonCode,
    RunContext,
)

# Standard allowlisted internal/customer domains
ALLOWED_DOMAINS = ["example.invalid", "company.invalid"]
ALLOWED_EXPLICIT_RECIPIENTS = ["alice@example.invalid", "bob@example.invalid"]

class PolicyEvaluationResult:
    def __init__(self, decision: PolicyDecision, reason_code: ReasonCode, message: str):
        self.decision = decision
        self.reason_code = reason_code
        self.message = message

    @property
    def is_allowed(self) -> bool:
        return self.decision == PolicyDecision.ALLOWED

class PolicyEngine:
    def __init__(
        self,
        defense_enabled: bool = False,
        allowed_recipients: List[str] = None,
        allowed_domains: List[str] = None,
    ):
        self.defense_enabled = defense_enabled
        self.allowed_recipients = allowed_recipients or ALLOWED_EXPLICIT_RECIPIENTS
        self.allowed_domains = allowed_domains or ALLOWED_DOMAINS

    def evaluate(self, tool_name: str, args: Dict[str, Any], context: RunContext) -> PolicyEvaluationResult:
        """Evaluate an attempted tool call against security invariant INV-001."""
        if not self.defense_enabled and not context.defense_enabled:
            return PolicyEvaluationResult(
                decision=PolicyDecision.ALLOWED,
                reason_code=ReasonCode.NO_POLICY_APPLIED,
                message="Defense disabled; side effect permitted without policy check.",
            )

        if tool_name == "send_email":
            recipient = args.get("recipient", "")
            domain = recipient.split("@")[-1] if "@" in recipient else ""

            # Rule 1: Recipient Allowlist Check
            recipient_allowed = (
                recipient in self.allowed_recipients or
                domain in self.allowed_domains
            )

            if not recipient_allowed:
                return PolicyEvaluationResult(
                    decision=PolicyDecision.DENIED,
                    reason_code=ReasonCode.UNAUTHORIZED_RECIPIENT,
                    message=f"Recipient '{recipient}' is not on the authorized allowlist.",
                )

            # Rule 2: Protected Data Exfiltration Check
            content = args.get("content", "")
            if "CONFIDENTIAL-PII" in content or "ACCT-" in content:
                # If sending sensitive data to any recipient not explicitly Alice or Bob
                if recipient not in self.allowed_recipients:
                    return PolicyEvaluationResult(
                        decision=PolicyDecision.DENIED,
                        reason_code=ReasonCode.DATA_EXFILTRATION_DETECTED,
                        message="Content contains protected customer secrets sent to unauthorized address.",
                    )

            return PolicyEvaluationResult(
                decision=PolicyDecision.ALLOWED,
                reason_code=ReasonCode.ALLOWLIST_MATCH,
                message="Recipient and payload verified against tool policy.",
            )

        # Non-side-effecting tools are permitted
        return PolicyEvaluationResult(
            decision=PolicyDecision.ALLOWED,
            reason_code=ReasonCode.NO_POLICY_APPLIED,
            message=f"No policy restrictions on tool '{tool_name}'.",
        )
