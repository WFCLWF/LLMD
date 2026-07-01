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
    btn.classList.add('copied'); btn.textContent = '已复制';
    const id = Date.now(); copyTimers[id] = setTimeout(() => {
      btn.classList.remove('copied'); btn.textContent = '复制'; delete copyTimers[id];
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
    return `<pre>${langLabel}<button class="copy-code-btn" title="复制代码">复制</button><code>${codeHtml}</code></pre>`;
  });

  return html;
}

defineExpose({ scrollToBottom });
</script>

<style scoped>
.chat-window { flex: 1; overflow-y: auto; position: relative; }
.messages-inner { max-width: 800px; margin: 0 auto; padding: 20px 40px 0; }
.message { margin-bottom: 4px; }
.message-wrapper { padding: 12px 0; }
.message.user .message-wrapper { display: flex; flex-direction: column; align-items: flex-end; }
.role { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.role-avatar { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.message.user .role-avatar { background: var(--accent); color: #fff; }
.message.assistant .role-avatar { background: rgba(79,110,247,0.1); color: var(--accent); }
.role-name { font-size: 14px; font-weight: 600; }
.message-text { font-size: 15px; line-height: 1.75; word-wrap: break-word; }
.message.user .message-text { background: var(--bg-user-msg); padding: 10px 16px; border-radius: 16px 4px 16px 16px; max-width: 85%; }
.message.assistant .message-text { padding: 2px 0; }

.thinking-dots { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
.thinking-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--text-tertiary); animation: think 1.4s ease-in-out infinite; }
.thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes think { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }

.message-text :deep(pre) {
  background: var(--bg-code); border: 1px solid var(--border-color); border-radius: var(--radius-md);
  padding: 16px; padding-top: 32px; overflow-x: auto; margin: 8px 0; position: relative;
}
.message-text :deep(code) { font-family: "SF Mono","Fira Code","Courier New",monospace; font-size: 13px; }
.message-text :deep(pre code) { background: none; padding: 0; color: var(--text-primary); }
.message-text :deep(.code-lang) { position: absolute; top: 8px; left: 16px; font-size: 11px; color: var(--text-tertiary); pointer-events: none; }

.message-text :deep(.copy-code-btn) {
  position: absolute; top: 6px; right: 8px; padding: 2px 10px; font-size: 12px; font-family: inherit;
  background: rgba(0,0,0,0.04); color: var(--text-secondary); border: 1px solid var(--border-color);
  border-radius: 4px; cursor: pointer; transition: all 0.15s; z-index: 1;
}
.message-text :deep(.copy-code-btn:hover) { background: rgba(0,0,0,0.08); color: var(--text-primary); }
.message-text :deep(.copy-code-btn.copied) { background: rgba(82,196,26,0.1); border-color: #52c41a; color: #52c41a; }
.message-text :deep(p) { margin: 6px 0; }

.scroll-bottom-btn {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border-color);
  background: var(--bg-card); backdrop-filter: blur(10px); color: var(--text-secondary);
  cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}
.scroll-bottom-btn:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.fade-enter-active,.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,.fade-leave-to { opacity: 0; }

@media (max-width: 640px) { .messages-inner { padding: 12px 16px 0; } .message.user .message-text { max-width: 90%; } }
</style>
