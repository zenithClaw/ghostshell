const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');

let store;
(async () => {
    try {
        const StoreModule = await import('electron-store');
        const Store = StoreModule.default;
        store = new Store();
    } catch (e) {}
})();

const { convertToTab, tabs } = require('./tabs.js');

let mainWindow;
let isSaving = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520, height: 320,
    transparent: true, frame: false, alwaysOnTop: true, hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  // 关键修复：不要在启动时恢复位置，只在 Option+Space 唤醒时计算位置
  // 否则拔线瞬间，macOS 的坐标混乱会立刻污染我们的 Store
  mainWindow.loadFile('index.html');
  if (app.dock) app.dock.hide();

  // 监听移动，但我们要判断这是否是用户的“主动拖拽”
  mainWindow.on('moved', () => {
    if (!isSaving) {
        saveConfig();
    }
  });
}

function saveConfig() {
    if (!store || !mainWindow || !mainWindow.isVisible()) return;
    const bounds = mainWindow.getBounds();
    const displays = screen.getAllDisplays();
    const currentDisplay = screen.getDisplayMatching(bounds);
    
    // 核心逻辑：我们分别为每一个 Display ID 存储一个它在该屏幕下的首选坐标
    // 这样拔线时，笔记本屏幕的坐标存入 laptop 槽位，外接屏坐标存入 external 槽位，互不污染
    let layouts = store.get('layouts') || {};
    layouts[currentDisplay.id] = {
        x: bounds.x - currentDisplay.bounds.x,
        y: bounds.y - currentDisplay.bounds.y
    };
    store.set('layouts', layouts);
    console.log('Saved layout for display:', currentDisplay.id);
}

function restoreLayout() {
    if (!store || !mainWindow) return;
    const layouts = store.get('layouts') || {};
    const point = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(point);
    
    const savedLayout = layouts[currentDisplay.id];
    
    isSaving = true; // 暂时加锁，防止 setPosition 触发 moved 事件导致写回错误坐标
    if (savedLayout) {
        // 如果这个屏幕有记忆，飞回去
        mainWindow.setPosition(
            Math.round(currentDisplay.bounds.x + savedLayout.x),
            Math.round(currentDisplay.bounds.y + savedLayout.y)
        );
    } else {
        // 如果是个新屏幕，居中
        mainWindow.setPosition(
            Math.round(currentDisplay.bounds.x + (currentDisplay.bounds.width - 520) / 2),
            Math.round(currentDisplay.bounds.y + (currentDisplay.bounds.height - 320) / 2)
        );
    }
    setTimeout(() => { isSaving = false; }, 100);
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Option+Space', () => {
    if (mainWindow.isVisible()) {
      // 消失前最后存一次
      saveConfig();
      mainWindow.hide();
    } else {
      // 唤醒瞬间：根据当前鼠标所在屏幕，决定落点
      restoreLayout();
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
