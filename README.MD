# LLMD - 智能 AI 对话桌面应用

基于 **Vue 3 + Element Plus + Electron + FastAPI** 的跨平台桌面 AI 对话工具，支持 DeepSeek 及兼容 OpenAI API 的大语言模型。

![Tech Stack](https://img.shields.io/badge/Vue-3.5-4fc08d?logo=vuedotjs) ![Electron](https://img.shields.io/badge/Electron-26-47848f?logo=electron) ![FastAPI](https://img.shields.io/badge/FastAPI-0.1-009688?logo=fastapi) ![Python](https://img.shields.io/badge/Python-3.8+-3776ab?logo=python)

---

## ✨ 功能

- 💬 **流式对话** — SSE 实时输出，逐字显示 AI 回复
- 🎨 **浅色玻璃态 UI** — 半透明毛玻璃效果，现代简洁风格
- 📂 **侧边栏管理** — 多轮对话历史，支持批量删除
- ⚙️ **可视化配置** — Element Plus 弹窗修改 API Key / URL / Model
- 📋 **代码复制** — 代码块一键复制，保留多行原始格式
- 🪟 **无边框窗口** — 自定义标题栏 + 窗口控制按钮
- ⌨️ **快捷键** — Enter 发送 / Shift+Enter 换行 / Ctrl+B 侧边栏
- 🔄 **配置持久化** — 所有设置保存到 `backend/config.json`

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本 |
|------|------|
| Node.js | ≥ 16 |
| Python | ≥ 3.8 |

### 1. 安装依赖

```bash
# 前端依赖
npm install

# Python 依赖
pip install fastapi uvicorn pydantic httpx openai
```

### 2. 配置 API

编辑 `backend/config.json`，或在应用内点击 **设置** 修改：

```json
{
  "api": {
    "api_key": "你的-API-KEY",
    "base_url": "https://api.deepseek.com",
    "model": "deepseek-v4-flash"
  }
}
```

### 3. 启动

**方式一：一键启动（推荐）**

双击项目根目录的 `启动LLMD.bat`，自动启动后端 + 前端。

**方式二：手动启动**

```bash
# 终端 1 - 启动后端 (端口 8054)
python backend/chat_api.py

# 终端 2 - 启动前端 (Vite 热重载 + Electron)
npm run dev
```

**方式三：仅浏览器预览**

```bash
python backend/chat_api.py    # 终端 1
npm run dev:vue               # 终端 2 → http://localhost:5173
```

---

## 📁 项目结构

```
LLMD/
├── backend/                   # Python 后端
│   ├── chat_api.py           # FastAPI 服务 (端口 8054)
│   ├── llm_chat.py           # LLM 对话逻辑
│   ├── config_manager.py     # 配置读写
│   └── config.json           # API 配置文件
├── src/                       # Vue 3 前端源码
│   ├── main.js               # Vue 入口
│   ├── App.vue               # 根组件
│   ├── api/index.js          # API 请求层
│   ├── components/
│   │   ├── Sidebar.vue       # 左侧边栏
│   │   ├── WelcomeScreen.vue # 欢迎页
│   │   ├── ChatWindow.vue    # 消息列表 + Markdown
│   │   ├── ChatInput.vue     # 输入框
│   │   └── SettingsModal.vue # 设置弹窗
│   └── styles/global.css     # 全局样式变量
├── electron-main.js           # Electron 主进程
├── preload.js                 # Electron 预加载
├── vite.config.js             # Vite 配置
├── index.html                 # Vite 入口
├── package.json               # 前端依赖
├── 启动LLMD.bat               # 一键启动脚本
└── README.MD
```

---

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat` | 流式对话 (SSE) |
| GET | `/api/config` | 获取 API 配置 |
| POST | `/api/config` | 更新 API 配置 |
| GET | `/api/suggest?q=xxx&engine=google` | 搜索建议代理 |

### POST /api/chat

```json
{ "user_input": "你好" }
```

响应：`text/event-stream` 流式输出。

### GET/POST /api/config

获取或更新 `{ api_key, base_url, model }` 配置，热更新即时生效。

---

## 🎨 主题特性

浅色 **玻璃拟态**（Glassmorphism）设计：

- 侧边栏：`rgba(255,255,255,0.72)` + `backdrop-filter: blur(20px)`
- 输入框：`rgba(255,255,255,0.60)` + 毛玻璃模糊
- 建议卡片、代码块：半透明白底 + 微弱阴影
- 用户消息：淡蓝 `#e8f0fe` 气泡

---

## ⌨️ 快捷键

| 操作 | 快捷键 |
|------|--------|
| 发送消息 | `Enter` |
| 换行 | `Shift + Enter` |
| 折叠侧边栏 | `Ctrl + B` |
| 双击标题栏 | 最大化/还原 |

---

## 🔧 支持的 LLM

| 服务 | Base URL | 说明 |
|------|----------|------|
| DeepSeek | `https://api.deepseek.com` | 推荐 |
| Ollama | `http://localhost:11434/v1` | 本地模型 |
| OpenAI 兼容 | 任意兼容地址 | — |

---

## 🐛 常见问题

**连接不到后端？** 确保 `python backend/chat_api.py` 已运行，端口 8054。

**配置不生效？** 保存后自动热重载。如仍无效，检查 `backend/config.json`。

**窗口控制按钮不工作？** 确认是通过 `npm run dev` 或 `npm start` 启动的 Electron 窗口。

---

## 📝 License

MIT
