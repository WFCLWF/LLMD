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

const shortcuts = ref([]);
const IPC = window.electronApi;

onMounted(async () => {
  try { shortcuts.value = await loadShortcuts(); } catch {}
});

async function persist() {
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
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-light);
}
.ql-icon {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  width: 52px; padding: 6px 2px; border-radius: 8px;
  cursor: pointer; transition: background 0.15s;
}
.ql-icon:hover { background: rgba(0,0,0,0.05); }
.ql-add-btn {
  border: 1px dashed var(--border-color);
  color: var(--text-tertiary);
}
.ql-add-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(79,110,247,0.04); }
.ql-label {
  font-size: 10px; color: var(--text-secondary); text-align: center;
  max-width: 48px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  line-height: 1.2;
}
</style>
