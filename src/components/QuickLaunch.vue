<template>
  <div class="quick-launch">
    <div
      v-for="s in shortcuts" :key="s.id"
      class="ql-icon" :title="s.name + '\n' + s.path"
      @click="launch(s)" @contextmenu.prevent="remove(s.id)"
    >
      <el-icon :size="18"><Link /></el-icon>
      <span class="ql-label">{{ s.name }}</span>
    </div>

    <div class="ql-icon ql-add-btn" @click="add" title="添加快捷方式">
      <el-icon :size="18"><Plus /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Link, Plus } from '@element-plus/icons-vue';
import { loadShortcuts, saveShortcuts } from '../api/index.js';

const STORAGE_KEY = 'llmd_shortcuts';
const shortcuts = ref([]);
const IPC = window.electronApi;

onMounted(async () => {
  // localStorage 优先（可靠），API 兜底
  try { shortcuts.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}
  try {
    const fromApi = await loadShortcuts();
    if (fromApi.length > 0) shortcuts.value = fromApi;
  } catch {}
});

async function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts.value));
  try { await saveShortcuts(shortcuts.value); } catch {}
}

async function add() {
  const filePath = await IPC?.pickShortcut?.();
  if (!filePath) return;
  const name = filePath.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '');
  shortcuts.value.push({ id: Date.now().toString(), name, path: filePath });
  persist();
}

function remove(id) {
  shortcuts.value = shortcuts.value.filter(s => s.id !== id);
  persist();
}

async function launch(s) {
  await IPC?.openShortcut?.(s.path);
}
</script>

<style scoped>
.quick-launch {
  display: flex; flex-wrap: wrap; gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
}
.ql-icon {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  width: 46px; padding: 5px 2px; border-radius: 7px;
  cursor: pointer; transition: all 0.15s;
  color: var(--text-secondary);
}
.ql-icon:hover { background: rgba(140,192,235,0.15); color: #5a9bc7; }
.ql-add-btn {
  border: 1px dashed var(--border-color);
  color: var(--text-tertiary);
}
.ql-add-btn:hover { border-color: var(--accent); color: #5a9bc7; background: rgba(140,192,235,0.12); }
.ql-label {
  font-size: 10px; font-weight: 500; color: var(--text-secondary); text-align: center;
  max-width: 42px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  line-height: 1.2;
}
</style>
