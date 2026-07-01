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
@import url('../styles/welcome.css');
</style>
