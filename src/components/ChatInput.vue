<template>
  <div class="chat-input-area">
    <div class="input-wrapper">
      <textarea ref="textareaRef" v-model="inputText" class="chat-input"
        :placeholder="disabled ? 'AI 正在回复...' : '给 LLMD 发送消息'"
        :disabled="disabled" rows="1"
        aria-label="输入消息"
        @keydown="onKeydown" @input="autoResize"></textarea>
      <button v-if="isStreaming" class="stop-btn" @click="$emit('stop')" title="停止生成" aria-label="停止生成回复">
        <el-icon :size="18"><VideoPause /></el-icon>
      </button>
      <button v-else class="send-btn" :disabled="!inputText.trim() || disabled" @click="send" title="发送消息" :aria-label="!inputText.trim() ? '请输入内容后发送' : '发送消息'">
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
  /* Shift+Enter 换行（默认行为，无需处理） */
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
@import url('../styles/chat-input.css');
</style>
