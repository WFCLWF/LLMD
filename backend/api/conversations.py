"""会话持久化接口"""
from fastapi import APIRouter

from models.schemas import ConversationsRequest
from state import conversation_store

router = APIRouter()


@router.get("/api/conversations")
async def get_conversations():
    return {"code": 200, "message": "ok", "data": conversation_store.load()}


@router.post("/api/conversations")
async def save_conversations(req: ConversationsRequest):
    ok = conversation_store.save(req.conversations, req.currentConvId)
    return {"code": 200 if ok else 500, "message": "ok" if ok else "保存会话失败"}
