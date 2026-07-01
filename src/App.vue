<template>
  <div class="app-container">
    <Sidebar
      :collapsed="sidebarCollapsed"
      :conversations="conversations"
      :currentConvId="currentConvId"
      :backendStatus="backendStatus"
      @select-conv="selectConversation"
      @delete-conv="deleteConversation"
      @delete-selected="deleteSelectedConversations"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      @open-settings="openSettings"
    />

    <div class="main-content" @click="onMainClick">
      <!-- 侧边栏折叠时的拉出按钮 -->
      <div v-if="sidebarCollapsed" class="pull-handle" @click.stop="sidebarCollapsed = false" title="展开侧边栏">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <!-- 顶部拖拽区 -->
      <div class="title-bar" @dblclick="toggleMaximize">
        <div class="drag-region"></div>
        <div class="window-controls">
          <button class="win-btn" @click="minimizeWindow" title="最小化">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect y="5" width="12" height="1.5" fill="currentColor"/></svg>
          </button>
          <button class="win-btn" @click="toggleMaximize" title="最大化">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <button class="win-btn win-close" @click="closeWindow" title="关闭">
            <svg width="12" height="12" viewBox="0 0 12 12"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
        </div>
      </div>

      <WelcomeScreen v-if="messages.length === 0 && !currentConvId" @send="handleSend" />
      <ChatWindow v-else ref="chatWindowRef" :messages="messages" :isStreaming="isStreaming" />
      <ChatInput ref="chatInputRef" :disabled="isStreaming" @send="handleSend" @stop="stopStreaming" :isStreaming="isStreaming" />
    </div>

    <SettingsModal :visible="showSettings" @update:visible="showSettings = $event" @saved="onConfigSaved" />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Sidebar from './components/Sidebar.vue';
import WelcomeScreen from './components/WelcomeScreen.vue';
import ChatWindow from './components/ChatWindow.vue';
import ChatInput from './components/ChatInput.vue';
import SettingsModal from './components/SettingsModal.vue';
import { chatStream, getConfig } from './api/index.js';
import { loadFromStorage, saveToStorage } from './storage/index.js';
import { applyTheme } from './themes.js';

const sidebarCollapsed = ref(true);
const showSettings = ref(false);
const conversations = reactive([]);
const currentConvId = ref(null);
const messages = reactive([]);
const isStreaming = ref(false);
const backendStatus = ref('connecting');
const chatWindowRef = ref(null);
const chatInputRef = ref(null);
let abortController = null;

// 1. 异步恢复会话（不阻塞渲染，加载完成后自动刷新 UI）
loadAndRestore();
// 1.5 加载主题（localStorage 优先，后端配置兜底）
initTheme();
// 2. 检测后端连接（异步，带重试）
initBackend();
// 3. 全局快捷键
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

function handleKeydown(e) {
  const inInput = document.activeElement?.tagName === 'TEXTAREA';

  // Esc：取消输入框焦点，不改变侧边栏
  if (e.key === 'Escape') {
    if (inInput) { e.preventDefault(); document.activeElement.blur(); }
    return;
  }

  // Enter：非输入框内 → 聚焦输入框，不改变侧边栏
  if (e.key === 'Enter' && !inInput && !e.ctrlKey && !e.metaKey) {
    if (document.activeElement?.closest('button, input, select, [role="button"]')) return;
    e.preventDefault();
    setTimeout(() => chatInputRef.value?.focus(), 50);
    return;
  }

  // Ctrl+N：新建会话
  if (e.key === 'n' && (e.ctrlKey || e.metaKey) && !inInput) {
    e.preventDefault(); newConversation(); return;
  }

  // Delete：删除当前会话
  if (e.key === 'Delete' && !inInput && currentConvId.value) {
    e.preventDefault();
    deleteConversation(currentConvId.value);
    return;
  }

  // Ctrl+方向键：仅非输入框时生效
  if (inInput) return;
  if (!e.ctrlKey && !e.metaKey) return;

  if (e.key === 'ArrowLeft') { e.preventDefault(); sidebarCollapsed.value = true; }
  else if (e.key === 'ArrowRight') { e.preventDefault(); sidebarCollapsed.value = false; }
  else if (e.key === 'ArrowUp') { e.preventDefault(); navHistory(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); navHistory(1); }
}

function navHistory(dir) {
  if (conversations.length === 0) return;
  let idx = conversations.findIndex(c => c.id === currentConvId.value);
  if (idx === -1) idx = dir === -1 ? 0 : -1;
  const next = (idx + dir + conversations.length) % conversations.length;
  selectConversation(conversations[next].id);
}
// 4. 持久化工具：防抖保存（50ms，流式场景合并高频写入）
let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveToStorage(conversations, currentConvId.value), 50);
}

async function initBackend(retries = 3) {
  backendStatus.value = 'connecting';
  for (let i = 0; i < retries; i++) {
    try {
      await getConfig();
      backendStatus.value = 'online';
      return;
    } catch {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));  // 1s, 2s, 3s 退避
      }
    }
  }
  backendStatus.value = 'error';
}

/** 从持久层恢复会话列表（侧边栏），但默认进入新对话 */
async function loadAndRestore() {
  const saved = await loadFromStorage();
  if (!saved || saved.conversations.length === 0) return;
  // 仅恢复侧边栏会话列表，不恢复上一次的对话内容
  conversations.push(...saved.conversations);
}

const truncate = (s, n = 30) => s.length > n ? s.slice(0, n) + '...' : s;
const minimizeWindow = () => window.electronApi?.minimize?.();
const toggleMaximize = () => window.electronApi?.maximize?.();
function closeWindow() {
  const plain = JSON.parse(JSON.stringify(conversations));
  window.electronApi?.closeWithSave?.({ conversations: plain, currentConvId: currentConvId.value || null });
}

function newConversation() {
  if (isStreaming.value) return;
  const conv = { id: Date.now().toString(), title: '新对话', messages: [] };
  conversations.unshift(conv);
  currentConvId.value = conv.id;
  messages.length = 0;
  scheduleSave();
}

function selectConversation(id) {
  const conv = conversations.find(c => c.id === id);
  if (!conv) return;
  currentConvId.value = id;
  messages.length = 0;
  messages.push(...conv.messages);
  scheduleSave();
  nextTick(() => chatWindowRef.value?.scrollToBottom());
}

function deleteConversation(id) {
  const idx = conversations.findIndex(c => c.id === id);
  if (idx !== -1) conversations.splice(idx, 1);
  if (currentConvId.value === id) { currentConvId.value = null; messages.length = 0; }
  scheduleSave();
}

function deleteSelectedConversations(ids) { ids.forEach(id => deleteConversation(id)); }

async function handleSend(userText) {
  if (isStreaming.value || !userText.trim()) return;

  if (!currentConvId.value) {
    const conv = { id: Date.now().toString(), title: truncate(userText), messages: [] };
    conversations.unshift(conv);
    currentConvId.value = conv.id;
  }

  const conv = conversations.find(c => c.id === currentConvId.value);
  if (conv && conv.messages.length === 0) conv.title = truncate(userText);

  messages.push({ role: 'user', content: userText });
  if (conv) conv.messages.push({ role: 'user', content: userText });
  scheduleSave();  // 用户消息立即触发存盘

  isStreaming.value = true;
  backendStatus.value = 'connecting';

  const aiMsg = reactive({ role: 'assistant', content: '' });
  messages.push(aiMsg);
  if (conv) conv.messages.push(aiMsg);

  nextTick(() => chatWindowRef.value?.scrollToBottom());

  try {
    abortController = new AbortController();
    // 发送当前会话的历史（排除本轮刚加的用户消息和空 AI 占位）
    const history = conv ? conv.messages.slice(0, -2) : [];
    const reader = await chatStream(userText, history);
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();  // 最后一段可能不完整，留到下次拼接
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const text = line.slice(6);
          if (text) aiMsg.content += text.replace(/\r/g, '\n');
        }
      }
      scheduleSave();
      nextTick(() => chatWindowRef.value?.scrollToBottom());
    }
    backendStatus.value = 'online';
  } catch (e) {
    if (e.name !== 'AbortError') {
      aiMsg.content += '\n\n❌ 连接失败，请确认后端服务已启动（端口 8054）。';
      backendStatus.value = 'error';
      ElMessage.error('连接后端服务失败');
    }
  } finally {
    isStreaming.value = false;
    abortController = null;
    scheduleSave();
    nextTick(() => chatWindowRef.value?.scrollToBottom());
    setTimeout(() => chatInputRef.value?.focus(), 50);
  }
}

function stopStreaming() {
  if (abortController) { abortController.abort(); abortController = null; isStreaming.value = false; }
}

async function openSettings() {
  // 打开设置时顺带刷新后端连接状态
  if (backendStatus.value !== 'online') initBackend();
  try { await getConfig(); } catch {}
  showSettings.value = true;
}

function onConfigSaved() { initBackend(); initTheme(); }

/* 加载主题：localStorage 优先 → 后端配置兜底 → 默认 warm */
async function initTheme() {
  // 快速路径：localStorage
  const saved = localStorage.getItem('llmd_theme');
  if (saved && applyTheme(saved)) return;
  // 后端兜底
  try {
    const cfg = await getConfig();
    const t = cfg?.data?.app?.theme || cfg?.theme;
    if (t) { applyTheme(t); localStorage.setItem('llmd_theme', t); return; }
  } catch {}
  applyTheme('warm');
}

/** 切换主题并持久化 */
window.__switchTheme = async function (key) {
  applyTheme(key);
  localStorage.setItem('llmd_theme', key);
  // 异步写入后端配置
  try { await fetch('http://127.0.0.1:8054/api/config/theme', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: key }) }); } catch {}
};
function onMainClick() { if (!sidebarCollapsed.value) sidebarCollapsed.value = true; }

</script>

<style scoped>
.app-container {
  display: flex; height: 100vh; width: 100vw; overflow: hidden; border-radius: 12px;
  position: relative; border: 2px solid var(--accent);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.18);
}

.pull-handle {
  position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(140,192,235,0.45); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer; z-index: 200; color: #fff;
  transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  border: 2px solid rgba(140,192,235,0.55);
  animation: handleIn 0.4s 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes handleIn { from { opacity: 0; transform: translateY(-50%) translateX(-12px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }
.pull-handle:hover {
  background: rgba(140,192,235,0.72); color: #fff;
  box-shadow: 0 2px 12px rgba(140,192,235,0.30);
  transform: translateY(-50%) scale(1.15);
}

.main-content {
  flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100vh;
  position: relative;
  background: var(--bg-main);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
}

.title-bar {
  height: 32px; display: flex; align-items: center; flex-shrink: 0;
  -webkit-app-region: drag; user-select: none;
}
.drag-region { flex: 1; height: 100%; }

.title-bar-btn {
  -webkit-app-region: no-drag; width: 30px; height: 30px; margin-left: 2px;
  background: none; border: none; border-radius: 6px;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.title-bar-btn:hover { background: rgba(0,0,0,0.05); color: var(--text-primary); }

.window-controls { display: flex; -webkit-app-region: no-drag; }
.win-btn {
  width: 36px; height: 28px; background: none; border: none;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.win-btn:hover { background: rgba(0,0,0,0.06); color: var(--text-primary); }
.win-close:hover { background: #e81123; color: #fff; }
</style>
