"""
共享状态 —— 全局服务实例，供各 API 路由模块引用
"""
import httpx
from services.llm_chat import LLMChat
from services.agent_chat import AgentChat
from managers.config import ConfigManager
from managers.mcp_config import McpConfigManager
from managers.conversation import ConversationStore

llmchat = LLMChat()
agent_chat = AgentChat()
config_manager = ConfigManager()
mcp_config_manager = McpConfigManager()
conversation_store = ConversationStore()

# 复用 httpx 客户端
http_client = httpx.AsyncClient(timeout=5.0)
