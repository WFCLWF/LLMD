"""
LLMD 后端入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.suggest import router as suggest_router
from api.chat import router as chat_router
from api.config import router as config_router
from api.mcp import router as mcp_router
from api.conversations import router as conversations_router
from api.shortcuts import router as shortcuts_router
from api.theme import router as theme_router

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(suggest_router)
app.include_router(chat_router)
app.include_router(config_router)
app.include_router(mcp_router)
app.include_router(conversations_router)
app.include_router(shortcuts_router)
app.include_router(theme_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8054, reload=True)
