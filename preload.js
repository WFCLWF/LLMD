const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  closeWithSave: (data) => ipcRenderer.send('close-with-save', data),
  // 会话持久化
  loadConversations: () => ipcRenderer.invoke('storage-load'),
  saveConversations: (data) => ipcRenderer.invoke('storage-save', data),
  // 快捷启动
  pickShortcut: () => ipcRenderer.invoke('pick-shortcut'),
  openShortcut: (filePath) => ipcRenderer.invoke('open-shortcut', filePath),
  loadShortcuts: () => ipcRenderer.invoke('shortcuts-load'),
  saveShortcuts: (data) => ipcRenderer.invoke('shortcuts-save', data),
});
