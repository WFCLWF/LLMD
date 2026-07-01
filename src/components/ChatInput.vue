<template>
  <div class="chat-input-area">
    <div class="input-wrapper">
      <textarea ref="textareaRef" v-model="inputText" class="chat-input"
        :placeholder="disabled ? 'AI 正在回复...' : '给 LLMD 发送消息'"
        :disabled="disabled" rows="1" @keydown="onKeydown" @input="autoResize"></textarea>
      <button v-if="isStreaming" class="stop-btn" @click="$emit('stop')" title="停止生成">
        <el-icon :size="18"><VideoPause /></el-icon>
      </button>
      <button v-else class="send-btn" :disabled="!inputText.trim() || disabled" @click="send" title="发送">
        <el-icon :size="20"><Promotion /></el-icon>
      </button>
    </div>
    <p class="input-disclaimer">LLMD 可能会产生不准确的信息，请注意甄别。</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Promotion, VideoPause } from '@element-plus/icons-vue';

const props = defineProps({ disabled: Boolean, isStreaming: Boolean });
const emit = defineEmits(['send', 'stop']);

const inputText = ref('');
const textareaRef = ref(null);

function autoResize() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 200) + 'px';
}
function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
}
function send() {
  const text = inputText.value.trim();
  if (!text || props.disabled) return;
  emit('send', text);
  inputText.value = '';
  const el = textareaRef.value;
  if (el) el.style.height = 'auto';
}
function focus() { textareaRef.value?.focus(); }
defineExpose({ focus });
</script>

<style scoped>
.chat-input-area { padding: 12px 18px 10px; flex-shrink: 0; }
.input-wrapper {
  max-width: 700px; margin: 0 auto; display: flex; align-items: flex-end; gap: 6px;
  background: var(--bg-input); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-color); border-radius: var(--radius-lg);
  padding: 6px 6px 6px 14px; transition: border-color 0.2s, box-shadow 0.2s;
}
.input-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(140,192,235,0.18);
}
.chat-input {
  flex: 1; background: none; border: none; outline: none; color: var(--text-primary);
  font-size: 14px; font-family: inherit; line-height: 1.5; resize: none;
  min-height: 22px; max-height: 180px; padding: 3px 0;
}
.chat-input::placeholder { color: var(--text-tertiary); }
.chat-input:disabled { opacity: 0.6; }

.send-btn,.stop-btn {
  width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; padding: 0;
}
.send-btn { background: var(--accent); color: #fff; }
.send-btn:hover:not(:disabled) { background: var(--accent-hover); transform: scale(1.05); }
.send-btn:active:not(:disabled) { transform: scale(0.95); }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.stop-btn { background: #e81123; color: #fff; }
.stop-btn:hover { background: #c00; }

.input-disclaimer { text-align: center; font-size: 11px; color: var(--text-tertiary); margin-top: 6px; max-width: 700px; margin-inline: auto; }
</style>
