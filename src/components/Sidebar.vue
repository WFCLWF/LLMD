<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="logo-area">
        <img :src="logoImg" class="logo-icon" alt="LLMD" />
        <span class="logo-text">LLMD</span>
      </div>
    </div>

    <QuickLaunch />

    <div class="conversation-list">
      <div class="conv-section-header">
        <span class="conv-section-title">对话历史</span>
        <button v-if="conversations.length > 0" class="manage-btn" @click="toggleManageMode" :title="manageMode ? '退出管理' : '管理对话'">
          {{ manageMode ? '完成' : '管理' }}
        </button>
      </div>
      <div class="conv-items">
        <div v-for="conv in conversations" :key="conv.id" class="conv-item"
          :class="{ active: conv.id === currentConvId && !manageMode, selected: selectedIds.has(conv.id) }"
          @click="onConvClick(conv.id)">
          <el-checkbox v-if="manageMode" :model-value="selectedIds.has(conv.id)" @click.stop @change="toggleSelect(conv.id)" class="conv-checkbox" />
          <el-icon v-else class="conv-icon" :size="16"><ChatDotRound /></el-icon>
          <span class="conv-title">{{ conv.title }}</span>
          <span v-if="!manageMode" class="conv-delete" @click.stop="$emit('delete-conv', conv.id)" title="删除对话">
            <el-icon :size="14"><Close /></el-icon>
          </span>
        </div>
        <div v-if="conversations.length === 0" class="conv-empty">暂无对话记录</div>
      </div>

      <div v-if="manageMode && conversations.length > 0" class="manage-actions">
        <el-button size="small" type="danger" :disabled="selectedIds.size === 0" @click="batchDelete">删除选中 ({{ selectedIds.size }})</el-button>
        <el-button size="small" @click="selectAll">{{ isAllSelected ? '取消全选' : '全选' }}</el-button>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-action" @click="$emit('open-settings')">
        <el-icon :size="18"><Setting /></el-icon><span>设置</span>
      </div>
      <div class="sidebar-status">
        <span class="status-dot" :class="backendStatus"></span>
        <span>{{ statusLabel }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ChatDotRound, Close, Setting } from '@element-plus/icons-vue';
import QuickLaunch from './QuickLaunch.vue';
import logoImg from '@/assets/logo.jpg';
import { useSidebar } from '../composables/useSidebar.js';

const props = defineProps({
  collapsed: Boolean, conversations: Array, currentConvId: String, backendStatus: String,
});
const emit = defineEmits(['select-conv', 'delete-conv', 'delete-selected', 'toggle-sidebar', 'open-settings']);

const {
  manageMode, selectedIds, isAllSelected, statusLabel,
  toggleManageMode, toggleSelect, selectAll, onConvClick, batchDelete,
} = useSidebar(props, emit);
</script>

<style scoped>
@import url('../styles/sidebar.css');
</style>
