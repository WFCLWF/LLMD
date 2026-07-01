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
import { ref, reactive, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import Sidebar from './components/Sidebar.vue';
import WelcomeScreen from './components/WelcomeScreen.vue';
import ChatWindow from './components/ChatWindow.vue';
import ChatInput from './components/ChatInput.vue';
import SettingsModal from './components/SettingsModal.vue';
import { chatStream, getConfig } from './api/index.js';

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

initBackend();

async function initBackend() {
  try { await getConfig(); backendStatus.value = 'online'; }
  catch { backendStatus.value = 'error'; }
}

function minimizeWindow() { window.electronApi?.minimize?.(); }
function toggleMaximize() { window.electronApi?.maximize?.(); }
function closeWindow() { window.electronApi?.close?.(); }

function newConversation() {
  if (isStreaming.value) return;
  const conv = { id: Date.now().toString(), title: '新对话', messages: [] };
  conversations.unshift(conv);
  currentConvId.value = conv.id;
  messages.length = 0;
  nextTick(() => chatInputRef.value?.focus());
}

function selectConversation(id) {
  const conv = conversations.find(c => c.id === id);
  if (!conv) return;
  currentConvId.value = id;
  messages.length = 0;
  messages.push(...conv.messages);
  nextTick(() => scrollToBottom());
}

function deleteConversation(id) {
  const idx = conversations.findIndex(c => c.id === id);
  if (idx !== -1) conversations.splice(idx, 1);
  if (currentConvId.value === id) { currentConvId.value = null; messages.length = 0; }
}

function deleteSelectedConversations(ids) { ids.forEach(id => deleteConversation(id)); }

async function handleSend(userText) {
  if (isStreaming.value || !userText.trim()) return;

  if (!currentConvId.value) {
    const title = userText.length > 30 ? userText.slice(0, 30) + '...' : userText;
    const conv = { id: Date.now().toString(), title, messages: [] };
    conversations.unshift(conv);
    currentConvId.value = conv.id;
  }

  const conv = conversations.find(c => c.id === currentConvId.value);
  if (conv && conv.messages.length === 0)
    conv.title = userText.length > 30 ? userText.slice(0, 30) + '...' : userText;

  messages.push({ role: 'user', content: userText });
  if (conv) conv.messages.push({ role: 'user', content: userText });

  isStreaming.value = true;
  backendStatus.value = 'connecting';

  const aiMsg = reactive({ role: 'assistant', content: '' });
  messages.push(aiMsg);
  if (conv) conv.messages.push(aiMsg);

  nextTick(() => { scrollToBottom(); chatInputRef.value?.focus(); });

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
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (content) {
            aiMsg.content += content.replace(/\r/g, '\n');
            nextTick(() => scrollToBottom());
          }
        }
      }
      buffer = lines[lines.length - 1];
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
    nextTick(() => scrollToBottom());
  }
}

function stopStreaming() {
  if (abortController) { abortController.abort(); abortController = null; isStreaming.value = false; }
}

async function openSettings() {
  try { await getConfig(); } catch {}
  showSettings.value = true;
}

function onConfigSaved() { initBackend(); }

function scrollToBottom() { chatWindowRef.value?.scrollToBottom(); }
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
