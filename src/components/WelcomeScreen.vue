<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <img :src="logoImg" class="welcome-logo" alt="LLMD Logo" />
      <p class="welcome-subtitle">AI-POWERED ASSISTANT</p>
      <h1 class="welcome-title">我是 <span class="welcome-title-accent">LLMD</span></h1>
      <p class="welcome-desc">基于 DeepSeek 大模型的智能AI助手<br />可以帮你解答问题、编写代码、创作内容</p>

      <div class="suggestion-cards" role="list" aria-label="快捷建议">
        <div
          v-for="card in suggestions" :key="card.prompt"
          class="suggestion-card" role="listitem"
          tabindex="0"
          @click="$emit('send', card.prompt)"
          @keydown.enter="$emit('send', card.prompt)"
          @keydown.space.prevent="$emit('send', card.prompt)"
        >
          <div class="suggestion-icon" aria-hidden="true">
            <el-icon :size="20"><component :is="card.icon" /></el-icon>
          </div>
          <span>{{ card.prompt }}</span>
        </div>
      </div>

      <div class="welcome-shortcuts" aria-label="快捷键提示">
        <span class="shortcut-badge">
          <kbd class="shortcut-key">Ctrl+N</kbd> 新建会话
        </span>
        <span class="shortcut-badge">
          <kbd class="shortcut-key">Enter</kbd> 聚焦输入
        </span>
        <span class="shortcut-badge">
          <kbd class="shortcut-key">Ctrl+←→</kbd> 侧边栏
        </span>
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
@import url('../styles/welcome.css');
</style>
