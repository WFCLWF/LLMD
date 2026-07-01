"""配置接口"""
from fastapi import APIRouter

from models.schemas import ConfigRequest
from services.llm_chat import LLMChat
from state import llmchat, agent_chat, config_manager

router = APIRouter()


@router.get("/api/config")
async def get_config():
    return {
        "code": 200,
        "message": "获取配置成功",
        "data": config_manager.get_api_config(),
    }


@router.post("/api/config")
async def update_config(config_data: ConfigRequest):
    try:
        config_manager.update_api_config(
            api_key=config_data.api_key,
            base_url=config_data.base_url,
            model=config_data.model,
        )
        # 重建 LLMChat 和 AgentChat 实例
        new_llm = LLMChat()
        import state
        state.llmchat = new_llm
        await agent_chat.reload()
        return {
            "code": 200,
            "message": "配置更新成功",
            "data": config_manager.get_api_config(),
        }
    except Exception as e:
        return {"code": 500, "message": f"配置更新失败: {str(e)}", "data": {}}
