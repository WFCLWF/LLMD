"""
Agent 对话服务 —— 从 agent_chat.py 重构
基于 LangChain create_agent，支持 MCP 工具集成
"""
import aiosqlite
from pathlib import Path
from typing import AsyncGenerator, Optional

from langchain.agents import create_agent
from langchain_openai.chat_models.base import BaseChatOpenAI
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langchain_mcp_adapters.client import MultiServerMCPClient

from managers.config import ConfigManager
from managers.mcp_config import McpConfigManager

CHECKPOINT_DB = Path(__file__).parent.parent / "data" / "agent_checkpoints.db"

from services.prompt import SYSTEM_PROMPT


def _extract_content(raw) -> str:
    if isinstance(raw, str):
        return raw
    if isinstance(raw, list):
        parts = []
        for block in raw:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
            elif isinstance(block, str):
                parts.append(block)
        return "".join(parts)
    return str(raw)


class AgentChat:
    """Agent 对话类"""

    def __init__(self):
        self._load_config()
        self._mcp_client: Optional[MultiServerMCPClient] = None
        self._agent = None
        self._tools: list = []
        self._memory = None
        self._initialized = False

    def _load_config(self):
        cfg = ConfigManager().get_api_config()
        self.api_key = cfg.get("api_key", "")
        self.base_url = cfg.get("base_url", "")
        self.model = cfg.get("model", "deepseek-v4-flash")
        self.mcp_config = McpConfigManager()

    async def _ensure_initialized(self):
        if self._initialized:
            return

        if self._memory is None:
            conn = await aiosqlite.connect(str(CHECKPOINT_DB))
            self._memory = AsyncSqliteSaver(conn)
            print(f"[AgentChat] Checkpoint 已连接: {CHECKPOINT_DB}")

        llm = BaseChatOpenAI(
            model=self.model,
            openai_api_key=self.api_key,
            openai_api_base=self.base_url,
        )

        tools = await self._load_mcp_tools()

        self._agent = create_agent(
            model=llm, tools=tools, checkpointer=self._memory, system_prompt=SYSTEM_PROMPT,
        )
        self._initialized = True
        print(f"[AgentChat] 初始化完成, model={self.model}, tools={len(tools)}")

    async def _load_mcp_tools(self) -> list:
        servers = self.mcp_config.get_mcp_servers()
        if not servers:
            print("[AgentChat] 未配置 MCP 服务器，纯 LLM 模式")
            return []

        # 逐个加载服务器，单个失败不影响其他
        import traceback
        all_tools = []
        for name, server_cfg in servers.items():
            try:
                client = MultiServerMCPClient({name: server_cfg})
                tools = await client.get_tools()
                for tool in tools:
                    if hasattr(tool, "name") and "." in tool.name:
                        tool.name = tool.name.replace(".", "_")
                all_tools.extend(tools)
                print(f"[AgentChat] MCP [{name}] 已加载 {len(tools)} 个工具")
            except Exception as e:
                print(f"[AgentChat] MCP [{name}] 连接失败: {e}")
                traceback.print_exc()

        self._tools = all_tools
        print(f"[AgentChat] 共加载 {len(all_tools)} 个 MCP 工具")
        return all_tools

    async def reload(self):
        """配置变更时立即重建 Agent（不等待下次请求）"""
        self._load_config()
        self._agent = None
        self._tools = []
        self._initialized = False
        await self._ensure_initialized()
        print("[AgentChat] MCP 配置已刷新，Agent 已重建")

    async def chat_stream(
        self, user_input: str, thread_id: str = "default",
    ) -> AsyncGenerator[str, None]:
        await self._ensure_initialized()

        config = {"configurable": {"thread_id": thread_id}}
        messages = {"messages": [{"role": "user", "content": user_input}]}

        seen_steps = set()
        try:
            async for chunk in self._agent.astream(messages, config, stream_mode="messages"):
                text = _extract_content(chunk[0].content)
                if not text:
                    continue
                step = chunk[1].get("langgraph_step", 0)
                if step not in seen_steps:
                    seen_steps.add(step)
                    print(f"\n>> Step {step}: {chunk[1].get('langgraph_node', '')}")
                yield text
        except Exception as e:
            print(f"[AgentChat] 流式异常: {e}")
            yield f"\n[错误] {str(e)}"

    async def get_loaded_tools(self) -> list:
        await self._ensure_initialized()
        return [
            {"name": t.name, "description": getattr(t, "description", "")}
            for t in self._tools
        ]
