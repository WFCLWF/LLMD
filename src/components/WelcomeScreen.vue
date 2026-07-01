<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <img :src="logoImg" class="welcome-logo" alt="LLMD" />
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
import logoImg from '@/assets/logo.jpg';
defineEmits(['send']);
const suggestions = [
  { prompt: '用Python写一个快速排序算法', icon: Document },
  { prompt: '解释一下什么是机器学习', icon: Clock },
  { prompt: '帮我写一封英文求职邮件', icon: Message },
  { prompt: 'React和Vue有什么区别？', icon: Guide },
];
</script>

<style scoped>
.welcome-screen { flex: 1; display: flex; align-items: center; justify-content: center; padding: 30px 18px; overflow-y: auto; animation: welcomeIn 0.5s ease-out; }
@keyframes welcomeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.welcome-content { text-align: center; max-width: 520px; width: 100%; }
.welcome-logo { width: 52px; height: 52px; border-radius: 12px; object-fit: cover; margin-bottom: 16px; }
.welcome-title { font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--text-primary); }
.welcome-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 28px; line-height: 1.7; }

.suggestion-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; text-align: left; }
.suggestion-card {
  display: flex; align-items: flex-start; gap: 8px; padding: 12px;
  background: var(--bg-card); backdrop-filter: blur(10px);
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
  cursor: pointer; transition: all 0.2s; font-size: 13px; color: var(--text-secondary); line-height: 1.5; width: 100%;
}
.suggestion-card:hover { background: var(--bg-card-hover); border-color: var(--accent); color: var(--text-primary); box-shadow: var(--shadow-sm); }
.suggestion-icon {
  flex-shrink: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  background: rgba(140,192,235,0.15); border-radius: var(--radius-sm); color: #5a9bc7;
}
@media (max-width: 640px) { .suggestion-cards { grid-template-columns: 1fr; } }
</style>
