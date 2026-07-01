"""
Pydantic 请求/响应模型 —— 从 chat_api.py 分离
"""
import pydantic


class ChatRequest(pydantic.BaseModel):
    user_input: str
    messages: list = []


class AgentChatRequest(pydantic.BaseModel):
    user_input: str
    thread_id: str = "default"
    messages: list = []


class ConfigRequest(pydantic.BaseModel):
    api_key: str = None
    base_url: str = None
    model: str = None


class ConversationsRequest(pydantic.BaseModel):
    conversations: list = []
    currentConvId: str = None


class McpServerRequest(pydantic.BaseModel):
    name: str
    config: dict = {}


class ShortcutsBody(pydantic.BaseModel):
    data: list = []


class ThemeBody(pydantic.BaseModel):
    theme: str = "warm"
