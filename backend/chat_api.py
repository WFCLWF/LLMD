from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse, JSONResponse
import uvicorn
import pydantic
import httpx
from fastapi.middleware.cors import CORSMiddleware
from llm_chat import LLMChat
from config_manager import ConfigManager
from conversation_store import ConversationStore


# 请求体
class chat_request(pydantic.BaseModel):
    user_input: str


# 配置请求体
class config_request(pydantic.BaseModel):
    api_key: str = None
    base_url: str = None
    model: str = None


# 会话持久化请求体
class conversations_request(pydantic.BaseModel):
    conversations: list = []
    currentConvId: str = None


app = FastAPI()
llmchat = LLMChat()
config_manager = ConfigManager()
conversation_store = ConversationStore()

# 复用 httpx 客户端，避免每次请求重新建立连接
http_client = httpx.AsyncClient(timeout=5.0)

# 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 搜索引擎建议 API 配置
SUGGEST_URLS = {
    "google": "https://suggestqueries.google.com/complete/search?client=chrome&q={query}",
    "bing": "https://api.bing.com/osjson.aspx?query={query}",
    "duckduckgo": "https://duckduckgo.com/ac/?q={query}",
}

# 搜索建议代理（绕过浏览器 CORS）
@app.get("/api/suggest")
async def suggest(q: str = Query(..., min_length=1), engine: str = Query(default="google")):
    url_template = SUGGEST_URLS.get(engine)
    if not url_template:
        return JSONResponse({"error": "unsupported engine"}, status_code=400)
    try:
        resp = await http_client.get(url_template.format(query=q))
        data = resp.json()
        return JSONResponse(data)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=502)


# 对话接口（流式SSE）
@app.post("/api/chat")
async def chat(chat_data: chat_request):
    def generate():
        for chunk in llmchat.chat_stream(chat_data.user_input):
            # 统一换行为 \r，避免 \n 被 SSE 协议当作行分隔符截断
            safe = chunk.replace('\r\n', '\r').replace('\n', '\r')
            yield f"data: {safe}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# 获取当前配置接口
@app.get("/api/config")
async def get_config():
    """获取当前 API 配置"""
    config = config_manager.get_api_config()
    return {
        "code": 200,
        "message": "获取配置成功",
        "data": config
    }


# 更新配置接口
@app.post("/api/config")
async def update_config(config_data: config_request):
    """更新 API 配置"""
    try:
        # 更新配置文件
        config_manager.update_api_config(
            api_key=config_data.api_key,
            base_url=config_data.base_url,
            model=config_data.model
        )
        
        # 重新加载 LLMChat 实例
        global llmchat
        llmchat = LLMChat()
        
        return {
            "code": 200,
            "message": "配置更新成功",
            "data": config_manager.get_api_config()
        }
    except Exception as e:
        return {
            "code": 500,
            "message": f"配置更新失败: {str(e)}",
            "data": {}
        }


# ==================== 会话持久化接口 ====================

@app.get("/api/conversations")
async def get_conversations():
    return {"code": 200, "message": "ok", "data": conversation_store.load()}


@app.post("/api/conversations")
async def save_conversations(req: conversations_request):
    ok = conversation_store.save(req.conversations, req.currentConvId)
    return {"code": 200 if ok else 500, "message": "ok" if ok else "保存会话失败"}


# ==================== 快捷启动接口 ====================
import json as _json
from pathlib import Path as _Path

_SHORTCUTS_PATH = _Path(__file__).parent / "shortcuts.json"

class _shortcuts_body(pydantic.BaseModel):
    data: list = []

@app.get("/api/shortcuts")
async def get_shortcuts():
    try:
        if _SHORTCUTS_PATH.exists():
            return {"code": 200, "data": _json.loads(_SHORTCUTS_PATH.read_text(encoding="utf-8"))}
    except Exception:
        pass
    return {"code": 200, "data": []}

@app.post("/api/shortcuts")
async def save_shortcuts(req: _shortcuts_body):
    try:
        _SHORTCUTS_PATH.write_text(_json.dumps(req.data, indent=2, ensure_ascii=False), encoding="utf-8")
        return {"code": 200}
    except Exception:
        return {"code": 500}


if __name__ == "__main__":
    uvicorn.run("chat_api:app", host="127.0.0.1", port=8054, reload=True)
