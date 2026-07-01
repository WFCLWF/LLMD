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
import { ref, computed } from 'vue';
import { ChatDotRound, Close, Setting } from '@element-plus/icons-vue';
import QuickLaunch from './QuickLaunch.vue';
import logoImg from '@/assets/logo.jpg';
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
  background: var(--bg-sidebar); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s, opacity 0.25s; overflow: hidden; z-index: 100;
}
.sidebar.collapsed { width: 0; min-width: 0; border-right: none; opacity: 0; pointer-events: none; }

.sidebar-header { padding: 14px 12px 12px; border-bottom: 1px solid var(--border-color); }
.logo-area { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.logo-icon { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.logo-text { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; color: var(--text-primary); }

.conversation-list { flex: 1; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; }
.conv-section-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 8px 6px; }
.conv-section-title { font-size: 11px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.5px; text-transform: uppercase; }
.manage-btn { font-size: 11px; font-weight: 500; color: var(--text-secondary); background: none; border: none; cursor: pointer; padding: 3px 8px; border-radius: 4px; font-family: inherit; transition: all 0.2s; }
.manage-btn:hover { color: #5a9bc7; background: rgba(140,192,235,0.15); }

.conv-items { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.conv-item { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 8px; cursor: pointer; transition: all 0.15s; color: var(--text-primary); font-size: 13px; font-weight: 500; }
.conv-item:hover { background: rgba(140,192,235,0.15); }
.conv-item.active { background: rgba(140,192,235,0.20); color: #5a9bc7; font-weight: 600; }
.conv-item.selected { background: rgba(140,192,235,0.15); outline: 1px solid rgba(140,192,235,0.45); }
.conv-icon { flex-shrink: 0; color: var(--text-secondary); }
.conv-item.active .conv-icon { color: var(--accent); }
.conv-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.conv-delete { flex-shrink: 0; opacity: 0; transition: opacity 0.2s; color: var(--text-tertiary); padding: 2px; border-radius: 4px; display: flex; }
.conv-item:hover .conv-delete { opacity: 1; }
.conv-delete:hover { color: #e81123; background: rgba(232,17,35,0.10); }
.conv-empty { color: var(--text-tertiary); font-size: 12px; padding: 12px; text-align: center; }

.manage-actions { display: flex; gap: 8px; padding: 8px 4px; border-top: 1px solid var(--border-color); margin-top: auto; }

.sidebar-footer { padding: 10px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 4px; }
.sidebar-action { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
.sidebar-action:hover { background: rgba(0,0,0,0.05); color: var(--text-primary); }
.sidebar-status { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: #52c41a; box-shadow: 0 0 4px rgba(82,196,26,0.4); }
.status-dot.error { background: #ff4d4f; box-shadow: 0 0 4px rgba(255,77,79,0.4); }
.status-dot.connecting { background: #faad14; box-shadow: 0 0 4px rgba(250,173,20,0.4); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
</style>
