<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="logo-area">
        <svg class="logo-icon" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#4f6ef7"/>
          <path d="M8 12.5C8 10.015 10.015 8 12.5 8h7c2.485 0 4.5 2.015 4.5 4.5v3c0 2.485-2.015 4.5-4.5 4.5h-7C10.015 20 8 17.985 8 15.5v-3z" fill="white" opacity="0.95"/>
          <circle cx="13" cy="14" r="1.3" fill="#4f6ef7"/>
          <circle cx="19" cy="14" r="1.3" fill="#4f6ef7"/>
          <path d="M12.5 17.5c.8.8 2.1 1.2 3.5 1.2s2.7-.4 3.5-1.2" stroke="#4f6ef7" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span class="logo-text">LLMD</span>
      </div>
      <el-button class="new-chat-btn" @click="$emit('new-chat')" :icon="Plus">新对话</el-button>
    </div>

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
import { ref, computed } from 'vue';
import { Plus, ChatDotRound, Close, Setting } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const props = defineProps({ collapsed: Boolean, conversations: Array, currentConvId: String, backendStatus: String });
const emit = defineEmits(['new-chat', 'select-conv', 'delete-conv', 'delete-selected', 'toggle-sidebar', 'open-settings']);

const manageMode = ref(false);
const selectedIds = ref(new Set());

function toggleManageMode() {
  manageMode.value = !manageMode.value;
  if (!manageMode.value) selectedIds.value.clear();
}
function toggleSelect(id) {
  const s = new Set(selectedIds.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selectedIds.value = s;
}
function selectAll() {
  if (selectedIds.value.size === props.conversations.length)
    selectedIds.value = new Set();
  else
    selectedIds.value = new Set(props.conversations.map(c => c.id));
}
const isAllSelected = computed(() => props.conversations.length > 0 && selectedIds.value.size === props.conversations.length);

function onConvClick(id) { manageMode.value ? toggleSelect(id) : emit('select-conv', id); }

async function batchDelete() {
  if (selectedIds.value.size === 0) return;
  try {
    await ElMessageBox.confirm(`确定删除 ${selectedIds.value.size} 个对话？`, '批量删除', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' });
    emit('delete-selected', [...selectedIds.value]);
    selectedIds.value.clear();
    manageMode.value = false;
  } catch {}
}

const statusLabel = computed(() => {
  if (props.backendStatus === 'online') return '后端就绪';
  if (props.backendStatus === 'connecting') return '连接中...';
  return '未连接后端';
});
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width); min-width: var(--sidebar-width); height: 100vh;
  background: var(--bg-sidebar); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-light);
  display: flex; flex-direction: column;
  transition: width 0.2s, min-width 0.2s, opacity 0.2s; overflow: hidden; z-index: 100;
}
.sidebar.collapsed { width: 0; min-width: 0; border-right: none; opacity: 0; pointer-events: none; }

.sidebar-header { padding: 16px; border-bottom: 1px solid var(--border-light); }
.logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.logo-icon { width: 32px; height: 32px; flex-shrink: 0; }
.logo-text { font-size: 20px; font-weight: 700; letter-spacing: 1px; }

.new-chat-btn {
  width: 100%;
  --el-button-bg-color: rgba(79,110,247,0.08);
  --el-button-border-color: transparent;
  --el-button-text-color: var(--accent);
  --el-button-hover-bg-color: rgba(79,110,247,0.15);
  --el-button-hover-text-color: var(--accent);
}

.conversation-list { flex: 1; overflow-y: auto; padding: 8px; display: flex; flex-direction: column; }
.conv-section-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 8px 6px; }
.conv-section-title { font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.5px; }
.manage-btn { font-size: 12px; color: var(--text-secondary); background: none; border: none; cursor: pointer; padding: 2px 6px; border-radius: 4px; font-family: inherit; transition: all 0.2s; }
.manage-btn:hover { color: var(--accent); background: rgba(79,110,247,0.06); }

.conv-items { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.conv-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; color: var(--text-secondary); font-size: 13px; }
.conv-item:hover { background: rgba(0,0,0,0.04); color: var(--text-primary); }
.conv-item.active { background: rgba(79,110,247,0.08); color: var(--accent); }
.conv-item.selected { background: rgba(79,110,247,0.06); outline: 1px solid rgba(79,110,247,0.2); }
.conv-icon { flex-shrink: 0; color: var(--text-tertiary); }
.conv-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.conv-delete { flex-shrink: 0; opacity: 0; transition: opacity 0.2s; color: var(--text-tertiary); padding: 2px; border-radius: 4px; display: flex; }
.conv-item:hover .conv-delete { opacity: 1; }
.conv-delete:hover { color: #e81123; background: rgba(232,17,35,0.06); }
.conv-empty { color: var(--text-tertiary); font-size: 13px; padding: 12px; text-align: center; }

.manage-actions { display: flex; gap: 8px; padding: 8px 4px; border-top: 1px solid var(--border-light); margin-top: auto; }

.sidebar-footer { padding: 12px; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 8px; }
.sidebar-action { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; font-size: 14px; cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
.sidebar-action:hover { background: rgba(0,0,0,0.04); color: var(--text-primary); }
.sidebar-status { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 12px; color: var(--text-tertiary); }
.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: #52c41a; }
.status-dot.error { background: #ff4d4f; }
.status-dot.connecting { background: #faad14; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
</style>
