"""MCP 服务器管理接口"""
import json

from fastapi import APIRouter
from pydantic import BaseModel

from models.schemas import McpServerRequest
from state import agent_chat, mcp_config_manager

router = APIRouter()


class McpConfigBody(BaseModel):
    config: dict = {}


@router.get("/api/mcp/servers")
async def get_mcp_servers():
    return {
        "code": 200,
        "message": "获取 MCP 服务器列表成功",
        "data": mcp_config_manager.get_server_list(),
    }


@router.post("/api/mcp/servers")
async def add_mcp_server(req: McpServerRequest):
    try:
        ok = mcp_config_manager.add_server(req.name, req.config)
        if ok:
            await agent_chat.reload()
            return {"code": 200, "message": f"MCP 服务器 '{req.name}' 添加成功"}
        return {"code": 500, "message": "保存配置失败"}
    except Exception as e:
        return {"code": 500, "message": f"添加失败: {str(e)}"}


@router.delete("/api/mcp/servers/{name}")
async def remove_mcp_server(name: str):
    try:
        ok = mcp_config_manager.remove_server(name)
        if ok:
            await agent_chat.reload()
            return {"code": 200, "message": f"MCP 服务器 '{name}' 已移除"}
        return {"code": 404, "message": f"MCP 服务器 '{name}' 不存在"}
    except Exception as e:
        return {"code": 500, "message": f"移除失败: {str(e)}"}


@router.put("/api/mcp/servers/{name}")
async def update_mcp_server(name: str, req: McpServerRequest):
    try:
        ok = mcp_config_manager.update_server(name, req.config)
        if ok:
            await agent_chat.reload()
            return {"code": 200, "message": f"MCP 服务器 '{name}' 更新成功"}
        return {"code": 404, "message": f"MCP 服务器 '{name}' 不存在"}
    except Exception as e:
        return {"code": 500, "message": f"更新失败: {str(e)}"}


# ---- 原始 JSON 编辑接口 ----

@router.get("/api/mcp/config")
async def get_mcp_raw_config():
    """返回原始 MCP 配置 JSON（供前端直接编辑）"""
    return {
        "code": 200,
        "data": mcp_config_manager.config,
    }


@router.put("/api/mcp/config")
async def save_mcp_raw_config(body: McpConfigBody):
    """直接覆写整个 MCP 配置 JSON"""
    try:
        mcp_config_manager.config = body.config
        mcp_config_manager.save_config()
        await agent_chat.reload()
        return {"code": 200, "message": "MCP 配置已保存"}
    except Exception as e:
        return {"code": 500, "message": f"保存失败: {str(e)}"}
