<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <svg class="welcome-logo" viewBox="0 0 64 64" fill="none">
        <rect width="64" height="64" rx="16" fill="#4f6ef7"/>
        <path d="M16 25c0-4.97 4.03-9 9-9h14c4.97 0 9 4.03 9 9v6c0 4.97-4.03 9-9 9H25c-4.97 0-9-4.03-9-9v-6z" fill="white" opacity="0.95"/>
        <circle cx="26" cy="28" r="2.6" fill="#4f6ef7"/>
        <circle cx="38" cy="28" r="2.6" fill="#4f6ef7"/>
        <path d="M25 35c1.6 1.6 4.2 2.4 7 2.4s5.4-.8 7-2.4" stroke="#4f6ef7" stroke-width="2.4" stroke-linecap="round"/>
      </svg>
      <h1 class="welcome-title">我是 LLMD</h1>
      <p class="welcome-desc">基于 DeepSeek 大模型的智能AI助手<br />可以帮你解答问题、编写代码、创作内容</p>

      <div class="suggestion-cards">
        <div v-for="card in suggestions" :key="card.prompt" class="suggestion-card" @click="$emit('send', card.prompt)">
          <div class="suggestion-icon"><el-icon :size="20"><component :is="card.icon" /></el-icon></div>
          <span>{{ card.prompt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Document, Clock, Message, Guide } from '@element-plus/icons-vue';
defineEmits(['send']);
const suggestions = [
  { prompt: '用Python写一个快速排序算法', icon: Document },
  { prompt: '解释一下什么是机器学习', icon: Clock },
  { prompt: '帮我写一封英文求职邮件', icon: Message },
  { prompt: 'React和Vue有什么区别？', icon: Guide },
];
</script>

<style scoped>
.welcome-screen { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; overflow-y: auto; }
.welcome-content { text-align: center; max-width: 600px; width: 100%; }
.welcome-logo { width: 64px; height: 64px; margin-bottom: 20px; }
.welcome-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.welcome-desc { font-size: 15px; color: var(--text-secondary); margin-bottom: 36px; line-height: 1.8; }

.suggestion-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; text-align: left; }
.suggestion-card {
  display: flex; align-items: flex-start; gap: 10px; padding: 14px;
  background: var(--bg-card); backdrop-filter: blur(10px);
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
  cursor: pointer; transition: all 0.2s; font-size: 14px; color: var(--text-secondary); line-height: 1.5; width: 100%;
}
.suggestion-card:hover { background: var(--bg-card-hover); border-color: var(--accent); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.suggestion-icon {
  flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: rgba(79,110,247,0.08); border-radius: var(--radius-sm); color: var(--accent);
}
@media (max-width: 640px) { .suggestion-cards { grid-template-columns: 1fr; } }
</style>
