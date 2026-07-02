<template>
  <aside class="sidebar" :class="{ collapsed }" aria-label="侧边栏导航">
    <div class="sidebar-header">
      <div class="logo-area">
        <img :src="logoImg" class="logo-icon" alt="LLMD 图标" />
        <span class="logo-text">LLMD</span>
      </div>
    </div>

    <QuickLaunch />

    <div class="conversation-list">
      <div class="conv-section-header">
        <span class="conv-section-title">对话历史</span>
        <button
          v-if="conversations.length > 0"
          class="manage-btn"
          @click="toggleManageMode"
          :title="manageMode ? '退出管理' : '管理对话'"
          :aria-label="manageMode ? '退出管理模式' : '进入管理模式'"
        >
          {{ manageMode ? '完成' : '管理' }}
        </button>
      </div>
      <div class="conv-items" role="list" aria-label="对话列表">
        <div
          v-for="conv in conversations" :key="conv.id"
          v-memo="[conv.id, conv.title, conv.id === currentConvId, selectedIds.has(conv.id), manageMode]"
          class="conv-item"
          :class="{ active: conv.id === currentConvId && !manageMode, selected: selectedIds.has(conv.id) }"
          role="listitem"
          :aria-selected="conv.id === currentConvId && !manageMode"
          tabindex="0"
          @click="onConvClick(conv.id)"
          @keydown.enter="onConvClick(conv.id)"
        >
          <el-checkbox
            v-if="manageMode"
            :model-value="selectedIds.has(conv.id)"
            @click.stop @change="toggleSelect(conv.id)"
            class="conv-checkbox"
            :aria-label="'选择对话: ' + conv.title"
          />
          <el-icon v-else class="conv-icon" :size="16" aria-hidden="true"><ChatDotRound /></el-icon>
          <span class="conv-title">{{ conv.title }}</span>
          <span
            v-if="!manageMode"
            class="conv-delete"
            role="button"
            tabindex="0"
            :aria-label="'删除对话: ' + conv.title"
            @click.stop="$emit('delete-conv', conv.id)"
            @keydown.enter.stop="$emit('delete-conv', conv.id)"
            @keydown.space.prevent.stop="$emit('delete-conv', conv.id)"
            title="删除对话"
          >
            <el-icon :size="14"><Close /></el-icon>
          </span>
        </div>
        <div v-if="conversations.length === 0" class="conv-empty">暂无对话记录</div>
      </div>

      <div v-if="manageMode && conversations.length > 0" class="manage-actions">
        <el-button size="small" type="danger" :disabled="selectedIds.size === 0" @click="batchDelete">
          删除选中 ({{ selectedIds.size }})
        </el-button>
        <el-button size="small" @click="selectAll">{{ isAllSelected ? '取消全选' : '全选' }}</el-button>
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="sidebar-action" @click="$emit('open-settings')" aria-label="打开设置">
        <el-icon :size="18" aria-hidden="true"><Setting /></el-icon><span>设置</span>
      </button>
      <div class="sidebar-status" role="status" aria-live="polite">
        <span class="status-dot" :class="backendStatus" aria-hidden="true"></span>
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
