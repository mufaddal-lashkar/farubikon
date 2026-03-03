import os
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic


def get_llm(streaming: bool = False):
    """
    Factory function — returns the correct LLM client based on env config.
    Keeps the rest of the codebase provider-agnostic.
    """

    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")

    # ─────────────────────────────────────────────────────────────
    # OpenAI
    # ─────────────────────────────────────────────────────────────
    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment")

        return ChatOpenAI(
            model=model,
            api_key=api_key,
            streaming=streaming,
            temperature=0.3,
        )

    # ─────────────────────────────────────────────────────────────
    # Groq (OpenAI-compatible API)
    # ─────────────────────────────────────────────────────────────
    elif provider == "groq":
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in environment")

        return ChatOpenAI(
            model=model,
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
            streaming=streaming,
            temperature=0.3,
        )

    # ─────────────────────────────────────────────────────────────
    # Anthropic
    # ─────────────────────────────────────────────────────────────
    elif provider == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is not set in environment")

        return ChatAnthropic(
            model=model,
            api_key=api_key,
            streaming=streaming,
            temperature=0.3,
        )

    else:
        raise ValueError(
            f"Unknown LLM_PROVIDER: '{provider}'. Must be 'openai', 'groq', or 'anthropic'"
        )