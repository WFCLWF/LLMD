/**
 * 侧边栏管理逻辑 —— 从 Sidebar.vue 分离
 */
import { ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';

export function useSidebar(props, emit) {
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
    if (selectedIds.value.size === props.conversations.length) {
      selectedIds.value = new Set();
    } else {
      selectedIds.value = new Set(props.conversations.map((c) => c.id));
    }
  }

  const isAllSelected = computed(
    () =>
      props.conversations.length > 0 &&
      selectedIds.value.size === props.conversations.length,
  );

  function onConvClick(id) {
    manageMode.value ? toggleSelect(id) : emit('select-conv', id);
  }

  async function batchDelete() {
    if (selectedIds.value.size === 0) return;
    try {
      await ElMessageBox.confirm(
        `确定删除 ${selectedIds.value.size} 个对话？`,
        '批量删除',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' },
      );
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

  return {
    manageMode,
    selectedIds,
    isAllSelected,
    statusLabel,
    toggleManageMode,
    toggleSelect,
    selectAll,
    onConvClick,
    batchDelete,
  };
}
