/**
 * 对话核心逻辑 —— 从 App.vue 分离
 * 会话管理、消息发送/流式接收、后端检测、快捷键、主题
 */
import { ref, reactive, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { chatStream, getConfig } from '../api/index.js';
import { loadFromStorage, saveToStorage } from '../storage/index.js';
import { applyTheme } from '../themes.js';

export function useChat() {
  // ---- 状态 ----
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

  // ---- 工具函数 ----
  const truncate = (s, n = 30) => (s.length > n ? s.slice(0, n) + '...' : s);

  // ---- 防抖保存 ----
  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveToStorage(conversations, currentConvId.value), 50);
  }

  // ---- 后端检测 ----
  async function initBackend(retries = 3) {
    backendStatus.value = 'connecting';
    for (let i = 0; i < retries; i++) {
      try {
        await getConfig();
        backendStatus.value = 'online';
        return;
      } catch {
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        }
      }
    }
    backendStatus.value = 'error';
  }

  // ---- 会话恢复 ----
  async function loadAndRestore() {
    const saved = await loadFromStorage();
    if (!saved || saved.conversations.length === 0) return;
    conversations.push(...saved.conversations);
  }

  // ---- 会话操作 ----
  function newConversation() {
    if (isStreaming.value) return;
    const conv = { id: Date.now().toString(), title: '新对话', messages: [] };
    conversations.unshift(conv);
    currentConvId.value = conv.id;
    messages.length = 0;
    scheduleSave();
  }

  function selectConversation(id) {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    currentConvId.value = id;
    messages.length = 0;
    messages.push(...conv.messages);
    scheduleSave();
    nextTick(() => chatWindowRef.value?.scrollToBottom());
  }

  function deleteConversation(id) {
    const idx = conversations.findIndex((c) => c.id === id);
    if (idx !== -1) conversations.splice(idx, 1);
    if (currentConvId.value === id) {
      currentConvId.value = null;
      messages.length = 0;
    }
    scheduleSave();
  }

  function deleteSelectedConversations(ids) {
    ids.forEach((id) => deleteConversation(id));
  }

  // ---- 消息发送 & 流式接收 ----
  async function handleSend(userText) {
    if (isStreaming.value || !userText.trim()) return;

    if (!currentConvId.value) {
      const conv = { id: Date.now().toString(), title: truncate(userText), messages: [] };
      conversations.unshift(conv);
      currentConvId.value = conv.id;
    }

    const conv = conversations.find((c) => c.id === currentConvId.value);
    if (conv && conv.messages.length === 0) conv.title = truncate(userText);

    messages.push({ role: 'user', content: userText });
    if (conv) conv.messages.push({ role: 'user', content: userText });
    scheduleSave();

    isStreaming.value = true;
    backendStatus.value = 'connecting';

    const aiMsg = reactive({ role: 'assistant', content: '' });
    messages.push(aiMsg);
    if (conv) conv.messages.push(aiMsg);

    nextTick(() => chatWindowRef.value?.scrollToBottom());

    try {
      abortController = new AbortController();
      const history = conv ? conv.messages.slice(0, -2) : [];
      const reader = await chatStream(userText, history, currentConvId.value);
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
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
    if (abortController) {
      abortController.abort();
      abortController = null;
      isStreaming.value = false;
    }
  }

  // ---- 主题 ----
  async function initTheme() {
    const saved = localStorage.getItem('llmd_theme');
    if (saved && applyTheme(saved)) return;
    try {
      const cfg = await getConfig();
      const t = cfg?.data?.app?.theme || cfg?.theme;
      if (t) {
        applyTheme(t);
        localStorage.setItem('llmd_theme', t);
        return;
      }
    } catch {}
    applyTheme('warm');
  }

  window.__switchTheme = async function (key) {
    applyTheme(key);
    localStorage.setItem('llmd_theme', key);
    try {
      await fetch('http://127.0.0.1:8054/api/config/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: key }),
      });
    } catch {}
  };

  // ---- 快捷键 ----
  function navHistory(dir) {
    if (conversations.length === 0) return;
    let idx = conversations.findIndex((c) => c.id === currentConvId.value);
    if (idx === -1) idx = dir === -1 ? 0 : -1;
    const next = (idx + dir + conversations.length) % conversations.length;
    selectConversation(conversations[next].id);
  }

  function handleKeydown(e) {
    const inInput = document.activeElement?.tagName === 'TEXTAREA';

    if (e.key === 'Escape') {
      if (inInput) {
        e.preventDefault();
        document.activeElement.blur();
      }
      return;
    }

    if (e.key === 'Enter' && !inInput && !e.ctrlKey && !e.metaKey) {
      if (document.activeElement?.closest('button, input, select, [role="button"]')) return;
      e.preventDefault();
      setTimeout(() => chatInputRef.value?.focus(), 50);
      return;
    }

    if (e.key === 'n' && (e.ctrlKey || e.metaKey) && !inInput) {
      e.preventDefault();
      newConversation();
      return;
    }

    if (e.key === 'Delete' && !inInput && currentConvId.value) {
      e.preventDefault();
      deleteConversation(currentConvId.value);
      return;
    }

    if (inInput) return;
    if (!e.ctrlKey && !e.metaKey) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      sidebarCollapsed.value = true;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      sidebarCollapsed.value = false;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navHistory(1);
    }
  }

  // ---- 窗口操作 ----
  const minimizeWindow = () => window.electronApi?.minimize?.();
  const toggleMaximize = () => window.electronApi?.maximize?.();
  function closeWindow() {
    const plain = JSON.parse(JSON.stringify(conversations));
    window.electronApi?.closeWithSave?.({
      conversations: plain,
      currentConvId: currentConvId.value || null,
    });
  }

  // ---- 设置 ----
  async function openSettings() {
    if (backendStatus.value !== 'online') initBackend();
    try {
      await getConfig();
    } catch {}
    showSettings.value = true;
  }

  function onConfigSaved() {
    initBackend();
    initTheme();
  }

  function onMainClick() {
    if (!sidebarCollapsed.value) sidebarCollapsed.value = true;
  }

  // ---- 初始化 ----
  loadAndRestore();
  initTheme();
  initBackend();
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  // ---- 导出 ----
  return {
    sidebarCollapsed,
    showSettings,
    conversations,
    currentConvId,
    messages,
    isStreaming,
    backendStatus,
    chatWindowRef,
    chatInputRef,
    handleSend,
    stopStreaming,
    selectConversation,
    deleteConversation,
    deleteSelectedConversations,
    openSettings,
    onConfigSaved,
    onMainClick,
    minimizeWindow,
    toggleMaximize,
    closeWindow,
  };
}
