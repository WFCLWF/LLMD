<template>
  <div class="chat-window" ref="chatEl" @scroll="onScroll" @click="onClick">
    <div class="messages-inner">
      <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
        <div class="message-wrapper">
          <div class="role">
            <img v-if="msg.role === 'user'" :src="logoImg" class="role-avatar user-avatar" alt="我" />
            <span v-else class="role-avatar">AI</span>
            <span class="role-name">{{ msg.role === 'user' ? 'ww' : 'LLMD' }}</span>
          </div>
          <div v-if="msg.role === 'assistant' && !msg.content && isStreaming" class="thinking-dots">
            <span></span><span></span><span></span>
          </div>
          <div v-else-if="msg.content" class="message-text" v-html="renderMarkdown(msg.content)"></div>
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
import logoImg from '@/assets/logo.jpg';
import { renderMarkdown } from '../utils/markdown.js';

const props = defineProps({ messages: Array, isStreaming: Boolean });

const chatEl = ref(null);
const bottomAnchor = ref(null);
const showScrollBtn = ref(false);

function scrollToBottom(smooth = false) {
  nextTick(() => {
    if (bottomAnchor.value) bottomAnchor.value.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  });
}
watch(() => props.messages.length, () => scrollToBottom());
watch(() => {
  if (props.messages.length > 0) return props.messages[props.messages.length - 1].content;
}, () => scrollToBottom());

function onScroll() {
  const el = chatEl.value;
  if (!el) return;
  showScrollBtn.value = (el.scrollHeight - el.scrollTop - el.clientHeight) > 120;
}

// 代码复制
function onClick(e) {
  const btn = e.target.closest('.copy-code-btn');
  if (!btn) return;
  const code = btn.closest('pre')?.querySelector('code');
  if (!code) return;

  let text = '';
  code.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    else if (node.nodeName === 'BR') text += '\n';
  });

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 2000);
  }).catch(() => {
    const range = document.createRange();
    range.selectNodeContents(code);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });
}

defineExpose({ scrollToBottom });
</script>

<style scoped>
@import url('../styles/chat-window.css');
</style>
