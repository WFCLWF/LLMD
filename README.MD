# LLMD

基于 LLM 的智能桌面助手，支持多模型切换、MCP 工具集成、会话记忆和主题定制。

## 功能

- **对话 & 编程** — 多轮对话、代码生成、信息检索
- **双模式** — LLM 直调 + Agent 模式（带 MCP 工具调用）
- **MCP 集成** — 支持 `streamable_http` / `stdio`，配置文件热加载
- **会话记忆** — Agent 模式 SQLite 持久化，重启不丢失
- **主题配色** — 暖桃 / 深海 / 藕紫 / 薄荷 / 暮色，即时切换

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Element Plus + Vite + Electron |
| 后端 | FastAPI + LangChain + LangGraph |
| LLM | OpenAI 兼容 API（DeepSeek 等） |
| 存储 | SQLite（agent checkpoint）+ JSON 文件 |

## 项目结构

```
LLMD/
├── backend/
│   ├── main.py                  # 后端入口
│   ├── state.py                 # 全局服务实例
│   ├── api/                     # 路由层
│   │   ├── chat.py              # /api/chat + /api/agent
│   │   ├── config.py            # /api/config
│   │   ├── mcp.py               # /api/mcp/*
│   │   ├── conversations.py     # /api/conversations
│   │   ├── shortcuts.py         # /api/shortcuts
│   │   ├── suggest.py           # /api/suggest
│   │   └── theme.py             # /api/config/theme
│   ├── services/                # 业务逻辑
│   │   ├── llm_chat.py          # LLM 直调
│   │   ├── agent_chat.py        # Agent 对话（MCP + 记忆）
│   │   └── prompt.py            # 系统提示词
│   ├── managers/                # 配置与数据管理
│   │   ├── config.py            # API 配置
│   │   ├── mcp_config.py        # MCP 服务器管理
│   │   └── conversation.py      # 会话存储
│   ├── models/schemas.py        # Pydantic 模型
│   ├── config/                  # 配置文件（不入库）
│   └── data/                    # 运行时数据（不入库）
├── src/                         # 前端源码
│   ├── components/              # Vue 组件
│   ├── composables/             # 业务 composables
│   ├── styles/                  # CSS 样式
│   ├── api/index.js             # API 封装
│   ├── utils/markdown.js        # Markdown 渲染
│   └── storage/index.js         # 本地存储
├── electron-main.js             # Electron 主进程
├── requirements.txt             # Python 依赖
├── package.json                 # Node.js 依赖
├── 启动LLMD.bat                 # 一键启动
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
# Python 后端（建议使用 conda 虚拟环境）
conda create -n LLMD python=3.10 -y
conda activate LLMD
pip install -r requirements.txt

# 前端
npm install
```

### 2. 配置

启动后在 **设置 → API 设置** 中填写：

- API Key（DeepSeek 或其他 OpenAI 兼容 API）
- Base URL（默认 `https://api.deepseek.com`）
- Model（如 `deepseek-v4-flash`）

### 3. 启动

```bash
# 一键启动
双击 启动LLMD.bat

# 或手动启动两个终端
python backend/main.py      # 后端 :8054
npm run dev                 # 前端 :5173
```

### 4. 访问

- 前端：`http://localhost:5173`
- 后端 docs：`http://127.0.0.1:8054/docs`

## MCP 工具

在 **设置 → MCP 设置** 中编辑 JSON 配置，支持注释和尾部逗号：

```json
{
  "mcpServers": {
    "smithery": {
      "url": "https://mcp.smithery.run/xxx",
      "transport": "streamable_http",
      "headers": { "Authorization": "Bearer xxx" }
    },
    "local_tool": {
      "command": "python",
      "args": ["./my_mcp_server.py"],
      "transport": "stdio"
    }
  }
}
```

保存后 Agent 自动断开旧连接并重新加载所有 MCP 工具。

## API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/chat` | LLM 直调（SSE 流式） |
| POST | `/api/agent` | Agent 对话（MCP 工具 + 记忆，SSE 流式） |
| GET | `/api/agent/tools` | 当前加载的 MCP 工具列表 |
| GET/POST | `/api/config` | API 配置读写 |
| GET/PUT | `/api/mcp/config` | MCP 配置 JSON 读写 |
| GET/POST | `/api/mcp/servers` | MCP 服务器 CRUD |
| GET/POST | `/api/conversations` | 会话持久化 |
| GET/POST | `/api/shortcuts` | 快捷启动 |
| GET/PUT | `/api/config/theme` | 主题配置 |
| GET | `/api/suggest` | 搜索引擎建议代理 |

## 快捷键

| 键 | 功能 |
|---|---|
| `Ctrl+N` | 新建会话 |
| `Delete` | 删除当前会话 |
| `Enter` | 聚焦输入框 |
| `Esc` | 取消输入框焦点 |
| `Ctrl+←/→` | 折叠/展开侧边栏 |
| `Ctrl+↑/↓` | 切换历史会话 |
