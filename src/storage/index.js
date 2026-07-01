// 会话持久化：Electron IPC 优先（主进程同步写盘），后端 API 兜底
import { loadConversations as apiLoad, saveConversations as apiSave } from '../api/index.js';

const IPC = window.electronApi;

export async function loadFromStorage() {
  if (IPC?.loadConversations) {
    try {
      const data = await IPC.loadConversations();
      if (data?.conversations?.length > 0) return data;
    } catch { /* IPC failed, try API */ }
  }
  // 后端 API 兜底，3 次重试
  for (let i = 0; i < 3; i++) {
    try { return await apiLoad(); } catch {
      if (i < 2) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return { conversations: [], currentConvId: null };
}

export async function saveToStorage(conversations, currentConvId) {
  let plain;
  try { plain = JSON.parse(JSON.stringify(conversations)); } catch { return; }
  const payload = { conversations: plain, currentConvId: currentConvId || null };

  if (IPC?.saveConversations) {
    try { await IPC.saveConversations(payload); return; } catch { /* fall through */ }
  }
  try { await apiSave(plain, currentConvId); } catch { /* both channels failed */ }
}
