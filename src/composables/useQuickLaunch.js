/**
 * 快捷启动逻辑 —— 从 QuickLaunch.vue 分离
 */
import { ref, onMounted } from 'vue';
import { loadShortcuts, saveShortcuts } from '../api/index.js';

const STORAGE_KEY = 'llmd_shortcuts';
const IPC = window.electronApi;

export function useQuickLaunch() {
  const shortcuts = ref([]);

  onMounted(async () => {
    try {
      shortcuts.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {}
    try {
      const fromApi = await loadShortcuts();
      if (fromApi.length > 0) shortcuts.value = fromApi;
    } catch {}
  });

  async function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts.value));
    try {
      await saveShortcuts(shortcuts.value);
    } catch {}
  }

  async function add() {
    const filePath = await IPC?.pickShortcut?.();
    if (!filePath) return;
    const name = filePath.replace(/^.*[\\/]/, '').replace(/\.[^.]+$/, '');
    shortcuts.value.push({ id: Date.now().toString(), name, path: filePath });
    persist();
  }

  function remove(id) {
    shortcuts.value = shortcuts.value.filter((s) => s.id !== id);
    persist();
  }

  async function launch(s) {
    await IPC?.openShortcut?.(s.path);
  }

  return { shortcuts, add, remove, launch };
}
