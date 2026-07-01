<template>
  <div class="chat-window" ref="chatEl" @scroll="onScroll" @click="onClick">
    <div class="messages-inner">
      <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
        <div class="message-wrapper">
          <div class="role">
            <span class="role-avatar">{{ msg.role === 'user' ? 'U' : 'AI' }}</span>
            <span class="role-name">{{ msg.role === 'user' ? '你' : 'LLMD' }}</span>
          </div>
          <div v-if="msg.role === 'assistant' && !msg.content && isStreaming" class="thinking-dots">
            <span></span><span></span><span></span>
          </div>
          <div v-else-if="msg.content" class="message-text" v-html="renderContent(msg.content)"></div>
        </div>
      </div>
      <div ref="bottomAnchor"></div>
    </div>
    <transition name="fade">
      <button v-if="showScrollBtn" class="scroll-bottom-btn" @click="scrollToBottom(true)">
        <el-icon :size="16"><ArrowDown /></el-icon>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';

const props = defineProps({ messages: Array, isStreaming: Boolean });

const chatEl = ref(null);
const bottomAnchor = ref(null);
const showScrollBtn = ref(false);

function scrollToBottom(smooth = false) {
  nextTick(() => { if (bottomAnchor.value) bottomAnchor.value.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' }); });
}
watch(() => props.messages.length, () => scrollToBottom());
watch(() => { if (props.messages.length > 0) return props.messages[props.messages.length - 1].content; }, () => scrollToBottom());

function onScroll() {
  const el = chatEl.value;
  if (!el) return;
  showScrollBtn.value = (el.scrollHeight - el.scrollTop - el.clientHeight) > 120;
}

// 代码复制
const copyTimers = {};
function onClick(e) {
  const btn = e.target.closest('.copy-code-btn');
  if (!btn) return;
  const code = btn.closest('pre')?.querySelector('code');
  if (!code) return;

  let text = '';
  code.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    else if (node.nodeName === 'BR') text += '\n';
  });

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const id = Date.now(); copyTimers[id] = setTimeout(() => {
      btn.classList.remove('copied'); delete copyTimers[id];
    }, 2000);
  }).catch(() => {
    const range = document.createRange(); range.selectNodeContents(code);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  });
}

// Markdown 渲染
function renderContent(text) {
  if (!text) return '';
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const codeBlocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang, code: code.trim() });
    return `\x00CB${idx}\x00`;
  });

  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(code);
    return `\x00IC${idx}\x00`;
  });

  html = html.replace(/\n/g, '<br>');

  html = html.replace(/\x00IC(\d+)\x00/g, (_, idx) => `<code>${inlineCodes[idx]}</code>`);

  html = html.replace(/\x00CB(\d+)\x00/g, (_, idx) => {
    const { lang, code } = codeBlocks[idx];
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
    const codeHtml = code.replace(/\n/g, '<br>');
    const copyIcon = `<svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    const checkIcon = `<svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    return `<pre>${langLabel}<button class="copy-code-btn" title="复制代码">${copyIcon}${checkIcon}</button><code>${codeHtml}</code></pre>`;
  });

  return html;
}

defineExpose({ scrollToBottom });
</script>

<style scoped>
.chat-window { flex: 1; overflow-y: auto; position: relative; }
.messages-inner { max-width: 700px; margin: 0 auto; padding: 14px 32px 0; }
.message { margin-bottom: 2px; }
.message-wrapper { padding: 8px 0; }
.message.user .message-wrapper { display: flex; flex-direction: column; align-items: flex-end; }
.role { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.role-avatar { width: 24px; height: 24px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.message.user .role-avatar { background: var(--accent); color: #fff; }
.message.assistant .role-avatar { background: rgba(140,192,235,0.18); color: #5a9bc7; }
.role-name { font-size: 12px; font-weight: 600; }
.message-text { font-size: 14px; line-height: 1.65; word-wrap: break-word; }
.message.user .message-text { background: var(--bg-user-msg); padding: 8px 14px; border-radius: 14px 4px 14px 14px; max-width: 85%; }
.message.assistant .message-text { padding: 1px 0; }

.thinking-dots { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
.thinking-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: think 1.4s ease-in-out infinite; }
.thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes think { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }

.message-text :deep(pre) {
  background: var(--bg-code); border: 1px solid var(--border-color); border-radius: var(--radius-md);
  padding: 12px; padding-top: 26px; overflow-x: auto; margin: 6px 0; position: relative;
}
.message-text :deep(code) { font-family: "SF Mono","Fira Code","Courier New",monospace; font-size: 12px; }
.message-text :deep(pre code) { background: none; padding: 0; color: var(--text-primary); }
.message-text :deep(.code-lang) { position: absolute; top: 6px; left: 12px; font-size: 10px; color: var(--text-tertiary); pointer-events: none; }

.message-text :deep(.copy-code-btn) {
  position: absolute; top: 5px; right: 6px;
  width: 26px; height: 26px; padding: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.7); color: var(--text-tertiary);
  border: 1px solid var(--border-color); border-radius: 5px;
  cursor: pointer; transition: all 0.2s; z-index: 1;
  backdrop-filter: blur(4px);
}
.message-text :deep(.copy-code-btn svg) { width: 12px; height: 12px; }
.message-text :deep(.copy-code-btn:hover) {
  background: rgba(255,255,255,0.95); color: var(--accent);
  border-color: var(--accent); box-shadow: 0 1px 3px rgba(79,110,247,0.15);
}
.message-text :deep(.copy-code-btn.copied) {
  background: rgba(82,196,26,0.08); border-color: #52c41a; color: #52c41a;
}
.message-text :deep(.copy-code-btn .copy-icon) { display: block; }
.message-text :deep(.copy-code-btn .check-icon) { display: none; }
.message-text :deep(.copy-code-btn.copied .copy-icon) { display: none; }
.message-text :deep(.copy-code-btn.copied .check-icon) { display: block; }
.message-text :deep(p) { margin: 4px 0; }

.scroll-bottom-btn {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--border-color);
  background: var(--bg-card); backdrop-filter: blur(10px); color: var(--text-secondary);
  cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}
.scroll-bottom-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.fade-enter-active,.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,.fade-leave-to { opacity: 0; }

@media (max-width: 640px) { .messages-inner { padding: 10px 14px 0; } .message.user .message-text { max-width: 90%; } }
</style>
