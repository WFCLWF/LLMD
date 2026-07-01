const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
const CONV_PATH = path.join(__dirname, 'backend', 'conversations.txt');
const SHORTCUTS_PATH = path.join(__dirname, 'backend', 'shortcuts.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 800, minWidth: 680, minHeight: 480,
    frame: false,
    backgroundColor: '#f0f2f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  win.once('ready-to-show', () => win.show());

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ====== IPC: 窗口控制 ======
ipcMain.on('window-minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.on('window-maximize', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  w?.[w.isMaximized() ? 'unmaximize' : 'maximize']?.();
});

// 关闭前同步写盘（渲染进程 → 主进程 → fs.writeFileSync → close）
ipcMain.on('close-with-save', (e, data) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  try { fs.writeFileSync(CONV_PATH, JSON.stringify(data, null, 2), 'utf-8'); } catch {}
  w?.close();
});

// ====== IPC: 会话文件读写 ======
ipcMain.handle('storage-load', async () => {
  try {
    if (fs.existsSync(CONV_PATH)) return JSON.parse(fs.readFileSync(CONV_PATH, 'utf-8'));
  } catch {}
  return { conversations: [], currentConvId: null };
});
ipcMain.handle('storage-save', async (_e, data) => {
  try { fs.writeFileSync(CONV_PATH, JSON.stringify(data, null, 2), 'utf-8'); return true; } catch { return false; }
});

// ====== IPC: 快捷启动应用 ======
ipcMain.handle('pick-shortcut', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '选择应用程序', properties: ['openFile'],
    filters: [
      { name: '应用程序', extensions: ['exe', 'lnk', 'app', 'AppImage', 'desktop'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('open-shortcut', async (_e, filePath) => {
  try {
    await shell.openPath(filePath);
    return true;
  } catch { return false; }
});

ipcMain.handle('shortcuts-load', async () => {
  try {
    if (fs.existsSync(SHORTCUTS_PATH)) return JSON.parse(fs.readFileSync(SHORTCUTS_PATH, 'utf-8'));
  } catch {}
  return [];
});

ipcMain.handle('shortcuts-save', async (_e, data) => {
  try { fs.writeFileSync(SHORTCUTS_PATH, JSON.stringify(data, null, 2), 'utf-8'); return true; } catch { return false; }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
