<template>
  <div class="app-container">
    <a href="#main-content" class="skip-link">跳转到主内容</a>

    <Sidebar
      :collapsed="sidebarCollapsed"
      :conversations="conversations"
      :currentConvId="currentConvId"
      :backendStatus="backendStatus"
      @select-conv="selectConversation"
      @delete-conv="deleteConversation"
      @delete-selected="deleteSelectedConversations"
      @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      @open-settings="openSettings"
    />

    <main class="main-content" id="main-content" @click="onMainClick">
      <div v-if="sidebarCollapsed" class="pull-handle" @click.stop="sidebarCollapsed = false" title="展开侧边栏" aria-label="展开侧边栏">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="title-bar" @dblclick="toggleMaximize">
        <div class="drag-region"></div>
        <nav class="window-controls" aria-label="窗口控制">
          <button class="win-btn" @click="minimizeWindow" title="最小化" aria-label="最小化窗口">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect y="5" width="12" height="1.5" fill="currentColor"/></svg>
          </button>
          <button class="win-btn" @click="toggleMaximize" title="最大化" aria-label="最大化窗口">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="1" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <button class="win-btn win-close" @click="closeWindow" title="关闭" aria-label="关闭窗口">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
        </nav>
      </div>

      <WelcomeScreen v-if="messages.length === 0 && !currentConvId" @send="handleSend" />
      <ChatWindow v-else ref="chatWindowRef" :messages="messages" :isStreaming="isStreaming" />
      <ChatInput ref="chatInputRef" :disabled="isStreaming" @send="handleSend" @stop="stopStreaming" :isStreaming="isStreaming" />
    </main>

    <SettingsModal v-if="showSettings" :visible="showSettings" @update:visible="showSettings = $event" @saved="onConfigSaved" />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import Sidebar from './components/Sidebar.vue';
import WelcomeScreen from './components/WelcomeScreen.vue';
import ChatWindow from './components/ChatWindow.vue';
import ChatInput from './components/ChatInput.vue';
import { useChat } from './composables/useChat.js';

/* 懒加载设置面板 -- 首屏不加载，打开时才加载 */
const SettingsModal = defineAsyncComponent(() => import('./components/SettingsModal.vue'));

const {
  sidebarCollapsed, showSettings, conversations, currentConvId,
  messages, isStreaming, backendStatus, chatWindowRef, chatInputRef,
  handleSend, stopStreaming, selectConversation, deleteConversation,
  deleteSelectedConversations, openSettings, onConfigSaved, onMainClick,
  minimizeWindow, toggleMaximize, closeWindow,
} = useChat();
</script>

<style scoped>
@import url('./styles/app.css');
</style>
