"""对话接口 —— /api/chat (原版) 和 /api/agent (新版)"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest, AgentChatRequest
from state import llmchat, agent_chat

router = APIRouter()


# ---- 原始 LLM 直调（另一个页面调用） ----
@router.post("/api/chat")
async def chat(chat_data: ChatRequest):
    def generate():
        for chunk in llmchat.chat_stream(chat_data.user_input, chat_data.messages):
            safe = chunk.replace("\r\n", "\r").replace("\n", "\r")
            yield f"data: {safe}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# ---- Agent 流式对话（支持 MCP 工具） ----
@router.post("/api/agent")
async def agent_chat_endpoint(chat_data: AgentChatRequest):
    async def generate():
        async for chunk in agent_chat.chat_stream(
            user_input=chat_data.user_input,
            thread_id=chat_data.thread_id,
        ):
            safe = chunk.replace("\r\n", "\r").replace("\n", "\r")
            yield f"data: {safe}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# ---- Agent 工具列表 ----
@router.get("/api/agent/tools")
async def get_agent_tools():
    tools = await agent_chat.get_loaded_tools()
    return {"code": 200, "message": "获取工具列表成功", "data": tools}
