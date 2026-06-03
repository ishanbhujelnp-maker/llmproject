"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Ollama API URL (local)
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/v1/chat/completions")

# Council members - list of model identifiers (OpenRouter or local Ollama models)
# To use a local Ollama model, prefix it with 'ollama/' (e.g. 'ollama/llama3')
COUNCIL_MODELS = [
    "ollama/qwen3-coder:480b-cloud",
    "ollama/gpt-oss:120b-cloud",
    "ollama/glm-4.7:cloud",
    "ollama/glm-4.6:cloud",
    "ollama/qwen3-coder-next:cloud"
]

# Chairman model - synthesizes final response
CHAIRMAN_MODEL = "ollama/qwen3-coder:480b-cloud"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
