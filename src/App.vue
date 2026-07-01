<template>
  <div class="app-container">
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

    <div class="main-content" @click="onMainClick">
      <div v-if="sidebarCollapsed" class="pull-handle" @click.stop="sidebarCollapsed = false" title="展开侧边栏">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="title-bar" @dblclick="toggleMaximize">
        <div class="drag-region"></div>
        <div class="window-controls">
          <button class="win-btn" @click="minimizeWindow" title="最小化">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect y="5" width="12" height="1.5" fill="currentColor"/></svg>
          </button>
          <button class="win-btn" @click="toggleMaximize" title="最大化">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
          <button class="win-btn win-close" @click="closeWindow" title="关闭">
            <svg width="12" height="12" viewBox="0 0 12 12"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
        </div>
      </div>

      <WelcomeScreen v-if="messages.length === 0 && !currentConvId" @send="handleSend" />
      <ChatWindow v-else ref="chatWindowRef" :messages="messages" :isStreaming="isStreaming" />
      <ChatInput ref="chatInputRef" :disabled="isStreaming" @send="handleSend" @stop="stopStreaming" :isStreaming="isStreaming" />
    </div>

    <SettingsModal :visible="showSettings" @update:visible="showSettings = $event" @saved="onConfigSaved" />
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import WelcomeScreen from './components/WelcomeScreen.vue';
import ChatWindow from './components/ChatWindow.vue';
import ChatInput from './components/ChatInput.vue';
import SettingsModal from './components/SettingsModal.vue';
import { useChat } from './composables/useChat.js';

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
