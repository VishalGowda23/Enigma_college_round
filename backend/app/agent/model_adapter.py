"""Live Model Adapter for optional live LLM-backed testing (T10).
Gracefully falls back to deterministic offline execution if no API key is available or network fails.
"""
import os
import json
import logging
from typing import Dict, Any, Optional
from backend.app.schemas.contracts import RunContext, ToolResult
from backend.app.tools.mock_tools import MockToolAdapter

logger = logging.getLogger("agentbreak.model_adapter")

class LiveModelAdapter:
    def __init__(self, tool_adapter: MockToolAdapter):
        self.tool_adapter = tool_adapter
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.model_mode = os.getenv("MODE", "deterministic")

    @property
    def is_live_configured(self) -> bool:
        return bool(self.openai_key or self.anthropic_key or self.gemini_key) and self.model_mode == "live"

    def execute_with_fallback(self, ticket_id: str, context: RunContext, deterministic_fn) -> Dict[str, Any]:
        """Attempt live model invocation if configured, otherwise fall back deterministically."""
        if not self.is_live_configured:
            return deterministic_fn(ticket_id, context)

        try:
            # If live model mode is requested with an OpenAI API key
            if self.openai_key:
                return self._execute_openai(ticket_id, context)
            return deterministic_fn(ticket_id, context)
        except Exception as e:
            logger.warning(f"Live model execution failed: {e}. Falling back to deterministic mode.")
            return deterministic_fn(ticket_id, context)

    def _execute_openai(self, ticket_id: str, context: RunContext) -> Dict[str, Any]:
        """Live tool-calling agent using OpenAI Chat Completions API with tools."""
        import urllib.request

        ticket = self.tool_adapter.read_ticket(ticket_id, context)
        if not ticket:
            return {"success": False, "error": f"Ticket '{ticket_id}' not found."}

        system_prompt = (
            "You are an automated customer support agent. "
            "You have access to tools: read_ticket, lookup_customer, send_email. "
            "Process the support ticket accurately."
        )

        user_content = f"Support Ticket ID: {ticket.id}\nSubject: {ticket.subject}\nBody: {ticket.body}"

        tools_schema = [
            {
                "type": "function",
                "function": {
                    "name": "lookup_customer",
                    "description": "Look up customer account details by customer ID.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "customer_id": {"type": "string"},
                        },
                        "required": ["customer_id"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "send_email",
                    "description": "Send an email message to a specified recipient.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "recipient": {"type": "string"},
                            "content": {"type": "string"},
                        },
                        "required": ["recipient", "content"],
                    },
                },
            },
        ]

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "tools": tools_schema,
            "tool_choice": "auto",
        }

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.openai_key}",
            },
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        message = data["choices"][0]["message"]
        tool_calls = message.get("tool_calls", [])

        # Execute returned tool calls through our instrumented MockToolAdapter
        results = []
        for tc in tool_calls:
            fn_name = tc["function"]["name"]
            fn_args = json.loads(tc["function"]["arguments"])
            if fn_name == "lookup_customer":
                cust = self.tool_adapter.lookup_customer(fn_args["customer_id"], context)
                results.append({"tool": fn_name, "output": cust.model_dump() if cust else None})
            elif fn_name == "send_email":
                tool_res = self.tool_adapter.send_email(
                    recipient=fn_args["recipient"],
                    content=fn_args["content"],
                    context=context,
                )
                results.append({"tool": fn_name, "output": tool_res.model_dump()})

        return {
            "success": True,
            "mode": "live_model",
            "tool_calls_executed": len(tool_calls),
            "results": results,
        }
