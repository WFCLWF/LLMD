# LLMD — 智能 AI 对话桌面应用

基于 **Vue 3 + Element Plus + Electron + FastAPI** 的跨平台桌面 AI 助手。半透明毛玻璃窗口，支持 DeepSeek 及全部 OpenAI 兼容接口。

---

## 功能

- 💬 **流式对话** — SSE 逐字输出，支持随时停止生成
- 🪟 **半透明窗口** — 毛玻璃模糊背景，圆角边框 + 外阴影，桌面融为一体
- 🎨 **5 套主题** — 暖桃 / 深海 / 藕紫 / 薄荷 / 暮色，热切换即时生效
- 📂 **会话管理** — 侧边栏多轮对话历史，默认折叠，`Ctrl+↑↓` 切换
- ⚡ **快捷启动** — 侧边栏图标式应用启动器，右键删除，存盘持久化
- 📋 **代码复制** — 悬停图标按钮，SVG 图标 + 对勾反馈
- ⌨️ **全键盘** — Enter 聚焦 / Esc 失焦 / Ctrl+方向键 / Delete 删除会话
- 🔄 **持久化** — 所有数据本地存盘，重启不丢

---

## 快速开始

### 环境

- Node.js ≥ 16
- Python ≥ 3.8

### 安装

```bash
npm install
pip install fastapi uvicorn pydantic httpx openai
```

### 配置

应用内打开 **设置** 面板填写，或直接编辑 `backend/config.json`：

```json
{
  "api": {
    "api_key": "你的-API-KEY",
    "base_url": "https://api.deepseek.com",
    "model": "deepseek-v4-flash"
  }
}
```

### 启动

```bash
# 终端 1 — 后端 :8054
python backend/chat_api.py

# 终端 2 — 前端 Electron
npm run dev
```

仅浏览器预览：`npm run dev:vue` → `http://localhost:5173`

---

## 交互方式

### 侧边栏

启动时默认折叠。左侧边缘有圆形毛玻璃按钮，点击拉出。点击主内容区域自动收起。`Ctrl+←→` 也可控制。

### 快捷键

| 操作 | 快捷键 |
|------|--------|
| 聚焦输入框 | `Enter`（输入框外） |
| 取消焦点 | `Esc`（输入框内） |
| 发送消息 | `Enter`（输入框内） |
| 换行 | `Shift + Enter` |
| 折叠侧边栏 | `Ctrl + ←` |
| 展开侧边栏 | `Ctrl + →` |
| 上一个会话 | `Ctrl + ↑` |
| 下一个会话 | `Ctrl + ↓` |
| 删除当前会话 | `Delete` |
| 最大化 / 还原 | 双击标题栏 |

---

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/chat` | 流式对话 (SSE) |
| `GET` | `/api/config` | 获取 API 配置 |
| `POST` | `/api/config` | 更新 API 配置 |
| `GET` | `/api/conversations` | 加载会话 |
| `POST` | `/api/conversations` | 保存会话 |
| `GET` | `/api/shortcuts` | 加载快捷启动 |
| `POST` | `/api/shortcuts` | 保存快捷启动 |
| `PUT` | `/api/config/theme` | 保存主题 |
| `GET` | `/api/config/theme` | 加载主题 |
| `GET` | `/api/suggest?q=&engine=` | 搜索建议代理 |

---

## 项目结构

```
LLMD/
├── backend/
│   ├── chat_api.py              FastAPI 入口
│   ├── llm_chat.py              LLM 对话逻辑
│   ├── config_manager.py        配置管理
│   ├── conversation_store.py    会话持久化
│   ├── config.json              用户 API 配置
│   ├── conversations.txt        会话数据
│   ├── shortcuts.json           快捷启动数据
│   └── theme.json              主题偏好
├── src/
│   ├── main.js                  Vue 入口
│   ├── App.vue                  根组件 + 全局交互 + 键盘快捷键
│   ├── themes.js                5 套主题预设
│   ├── api/index.js             后端 API 封装
│   ├── storage/index.js         双通道持久化 (IPC + API)
│   ├── components/
│   │   ├── Sidebar.vue          侧边栏
│   │   ├── QuickLaunch.vue      快捷启动面板
│   │   ├── WelcomeScreen.vue    欢迎页
│   │   ├── ChatWindow.vue       消息列表 + Markdown + 代码复制
│   │   ├── ChatInput.vue        输入框
│   │   └── SettingsModal.vue    设置 + 主题选择器
│   └── styles/global.css        全局样式变量
├── electron-main.js             Electron 主进程 (透明窗口 + IPC)
├── preload.js                   IPC 桥接层
├── vite.config.js
└── package.json
```

---

## 主题配色

| 方案 | 主色 / 辅色 | 风格 |
|------|-----------|------|
| 暖桃 | `#8CC0EB` `#FFF9D2` `#FFEBCC` | 温暖明亮 |
| 深海 | `#5088C8` `#E8F0FE` | 冷静蓝调 |
| 藕紫 | `#9878C8` `#F5F0FF` | 柔和紫调 |
| 薄荷 | `#58B888` `#F0FFF5` | 清新绿色 |
| 暮色 | `#6088C0` `#1E2230` | 深色护眼 |

设置面板中点击色块即时切换，自动存盘，下次启动自动应用。

---

## 支持的模型

| 服务 | Base URL |
|------|----------|
| DeepSeek | `https://api.deepseek.com` |
| OpenAI | `https://api.openai.com/v1` |
| Ollama | `http://localhost:11434/v1` |
| 其他兼容 | 任意 OpenAI 兼容地址 |

---

## License

MIT
