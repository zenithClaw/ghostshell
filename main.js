const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');

let store;
(async () => {
    try {
        const StoreModule = await import('electron-store');
        const Store = StoreModule.default;
        store = new Store();
    } catch (e) {
        console.error("Store init failed", e);
    }
})();

const { convertToTab, tabs } = require('./tabs.js');

let mainWindow;
let checkInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 320,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  // 初始加载时尝试恢复位置
  restorePosition();

  mainWindow.on('moved', () => {
    savePosition();
  });

  mainWindow.loadFile('index.html');
  if (app.dock) app.dock.hide();

  checkInterval = setInterval(() => {
    if (!mainWindow || !mainWindow.isVisible()) return;
    try {
        let bounds = mainWindow.getBounds();
        let display = screen.getDisplayMatching(bounds);
        if (bounds.x + bounds.width > display.bounds.x + display.bounds.width - 5) {
          require('./tabs.js').convertToTab(mainWindow, 'right');
        } else if (bounds.x < display.bounds.x + 5) {
          require('./tabs.js').convertToTab(mainWindow, 'left');
        }
    } catch(e) {}
  }, 300);
}

function savePosition() {
    if (!store || !mainWindow) return;
    const bounds = mainWindow.getBounds();
    const display = screen.getDisplayMatching(bounds);
    // 存储相对于特定显示器的坐标 (非常关键，防止换屏位移)
    const relativePos = {
        displayId: display.id,
        relX: bounds.x - display.bounds.x,
        relY: bounds.y - display.bounds.y,
        width: bounds.width,
        height: bounds.height
    };
    store.set('relativePos', relativePos);
    console.log('Saved relative pos for display', display.id);
}

function restorePosition() {
    if (!store || !mainWindow) return;
    const saved = store.get('relativePos');
    if (!saved) return;

    const displays = screen.getAllDisplays();
    // 优先寻找 ID 匹配的显示器
    let targetDisplay = displays.find(d => d.id === saved.displayId);
    
    // 如果原显示器没了（拔了线），就降级使用当前鼠标所在的显示器
    if (!targetDisplay) {
        targetDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    }

    const newX = targetDisplay.bounds.x + saved.relX;
    const newY = targetDisplay.bounds.y + saved.relY;

    // 边界检查，防止窗口飞到屏幕外面看不到的地方
    mainWindow.setPosition(Math.round(newX), Math.round(newY));
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Option+Space', () => {
    const tabsList = require('./tabs.js').tabs;
    if (tabsList.length > 0) {
        tabsList.forEach(t => t.tabWindow.close());
        tabsList.length = 0;
        restorePosition(); // 呼出时恢复到该在的位置
        mainWindow.show();
        return;
    }

    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      // 唤醒瞬间：重新执行多屏连续性逻辑
      restorePosition();
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  clearInterval(checkInterval);
  globalShortcut.unregisterAll();
});
