<template>
  <div class="app-container">
    <Sidebar
      :collapsed="sidebarCollapsed"
      :conversations="conversations"
      :currentConvId="currentConvId"
      :backendStatus="backendStatus"
      @new-chat="newConversation"
      @select-conv="selectConversation"
      @delete-conv="deleteConversation"
      @delete-selected="deleteSelectedConversations"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      @open-settings="openSettings"
    />

    <div class="main-content">
      <!-- 顶部拖拽区 -->
      <div class="title-bar" @dblclick="toggleMaximize">
        <button v-if="sidebarCollapsed" class="title-bar-btn" @click="sidebarCollapsed = false" title="展开侧边栏">
          <el-icon :size="16"><Expand /></el-icon>
        </button>
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

const sidebarCollapsed = ref(false);
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
// 2. 检测后端连接（异步，带重试）
initBackend();
// 3. 启动后自动聚焦输入框
onMounted(() => { setTimeout(() => chatInputRef.value?.focus(), 100); });
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
  setTimeout(() => chatInputRef.value?.focus(), 50);
}

function selectConversation(id) {
  const conv = conversations.find(c => c.id === id);
  if (!conv) return;
  currentConvId.value = id;
  messages.length = 0;
  messages.push(...conv.messages);
  scheduleSave();
  nextTick(() => chatWindowRef.value?.scrollToBottom());
  // 延迟聚焦：等 Sidebar click 事件完全结束后再切焦点，避免被浏览器归还焦点覆盖
  setTimeout(() => chatInputRef.value?.focus(), 50);
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

  nextTick(() => { chatWindowRef.value?.scrollToBottom(); chatInputRef.value?.focus(); });

  try {
    abortController = new AbortController();
    const reader = await chatStream(userText);
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
    scheduleSave();  // 流式结束/出错后最终存盘
    nextTick(() => chatWindowRef.value?.scrollToBottom());
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

function onConfigSaved() { initBackend(); }

</script>

<style scoped>
.app-container { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

.main-content {
  flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100vh;
  position: relative; background: var(--bg-main);
}

.title-bar {
  height: 38px; display: flex; align-items: center; flex-shrink: 0;
  -webkit-app-region: drag; user-select: none;
}
.drag-region { flex: 1; height: 100%; }

.title-bar-btn {
  -webkit-app-region: no-drag; width: 34px; height: 34px; margin-left: 4px;
  background: none; border: none; border-radius: 8px;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.title-bar-btn:hover { background: rgba(0,0,0,0.05); color: var(--text-primary); }

.window-controls { display: flex; -webkit-app-region: no-drag; }
.win-btn {
  width: 42px; height: 32px; background: none; border: none;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.win-btn:hover { background: rgba(0,0,0,0.06); color: var(--text-primary); }
.win-close:hover { background: #e81123; color: #fff; }
</style>
