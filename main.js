const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');

let store;
(async () => {
    try {
        const StoreModule = await import('electron-store');
        const Store = StoreModule.default;
        store = new Store();
    } catch (e) {
        console.error("Store failed:", e);
    }
})();

// 我们自己写一个极简的标签页逻辑，不再依赖外部可能出错的tabs.js状态
let mainWindow;
let isSaving = false;
let checkInterval;
let currentTabWindow = null;
let originalBoundsBeforeTab = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520, height: 320,
    transparent: true, frame: false, alwaysOnTop: true, hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.loadFile('index.html');
  if (app.dock) app.dock.hide();

  mainWindow.on('moved', () => {
    if (!isSaving && mainWindow.isVisible()) {
        saveConfig();
    }
  });

  // 边缘检测轮询
  checkInterval = setInterval(() => {
    // 只有当主窗口显示，且没有变成标签时才检测
    if (!mainWindow || !mainWindow.isVisible() || currentTabWindow) return;
    
    try {
        let bounds = mainWindow.getBounds();
        let display = screen.getDisplayMatching(bounds);
        
        // 触发条件：右边缘
        if (bounds.x + bounds.width >= display.bounds.x + display.bounds.width - 2) {
            convertToTab('right', bounds, display);
        } 
        // 触发条件：左边缘
        else if (bounds.x <= display.bounds.x + 2) {
            convertToTab('left', bounds, display);
        }
    } catch(e) {}
  }, 200);
}

function convertToTab(side, bounds, display) {
    if (currentTabWindow) return;
    
    originalBoundsBeforeTab = { ...bounds };
    mainWindow.hide();
    
    currentTabWindow = new BrowserWindow({
        width: 8,
        height: 80,
        x: side === 'right' ? display.bounds.x + display.bounds.width - 8 : display.bounds.x,
        y: bounds.y + bounds.height / 2 - 40,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        hasShadow: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    
    currentTabWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    
    const tabHtml = `
      <html>
        <body style="margin:0; padding:0; overflow:hidden; background:rgba(79, 172, 254, 0.8); border-radius:${side === 'right' ? '4px 0 0 4px' : '0 4px 4px 0'}; box-shadow: 0 0 15px rgba(79, 172, 254, 0.5); cursor:pointer; height:100vh; display:flex; align-items:center; justify-content:center;">
          <script>
             const { ipcRenderer } = require('electron');
             document.body.addEventListener('mouseenter', () => {
                ipcRenderer.send('restore-tab');
             });
          </script>
        </body>
      </html>
    `;
    currentTabWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(tabHtml)}`);
}

ipcMain.on('restore-tab', () => {
    restoreFromTab();
});

function restoreFromTab() {
    if (!currentTabWindow || !originalBoundsBeforeTab) return;
    
    let display = screen.getDisplayMatching(originalBoundsBeforeTab);
    let newX = originalBoundsBeforeTab.x;
    
    // 弹回时，往屏幕里面靠一点，防止立刻再次吸附
    if (newX + originalBoundsBeforeTab.width >= display.bounds.width - 10) {
        newX = display.bounds.x + display.bounds.width - originalBoundsBeforeTab.width - 20;
    }
    if (newX <= display.bounds.x + 10) {
        newX = display.bounds.x + 20;
    }
    
    isSaving = true;
    mainWindow.setBounds({
        ...originalBoundsBeforeTab,
        x: newX
    });
    
    mainWindow.show();
    currentTabWindow.close();
    currentTabWindow = null;
    originalBoundsBeforeTab = null;
    
    setTimeout(() => { isSaving = false; }, 200);
}

function saveConfig() {
    if (!store || !mainWindow) return;
    const bounds = mainWindow.getBounds();
    const point = screen.getCursorScreenPoint();
    
    // 【深度修复】：坚决不能用 getDisplayMatching(bounds)，因为拔线瞬间 bounds 会处于撕裂状态
    // 我们只信任“当前鼠标所在的屏幕”。你拖拽停下时，鼠标一定在那个屏幕里！
    const currentDisplay = screen.getDisplayNearestPoint(point);
    
    let layouts = store.get('layouts') || {};
    
    // 计算相对于当前屏幕原点的距离。
    layouts[currentDisplay.id] = {
        relX: bounds.x - currentDisplay.bounds.x,
        relY: bounds.y - currentDisplay.bounds.y
    };
    
    store.set('layouts', layouts);
    console.log('Saved layout for display:', currentDisplay.id, layouts[currentDisplay.id]);
}

function restoreLayout() {
    if (!store || !mainWindow) return;
    
    const layouts = store.get('layouts') || {};
    const point = screen.getCursorScreenPoint();
    // 唤醒时，严格以鼠标所在的屏幕为宿主
    const currentDisplay = screen.getDisplayNearestPoint(point);
    
    const savedLayout = layouts[currentDisplay.id];
    
    isSaving = true; 
    if (savedLayout) {
        // 使用相对坐标重新计算在这个屏幕上的绝对物理位置
        let targetX = currentDisplay.bounds.x + savedLayout.relX;
        let targetY = currentDisplay.bounds.y + savedLayout.relY;
        
        // 边界越界保护：防止跑到另一个屏幕去
        if (targetX < currentDisplay.bounds.x) targetX = currentDisplay.bounds.x + 20;
        if (targetX + 520 > currentDisplay.bounds.x + currentDisplay.bounds.width) {
            targetX = currentDisplay.bounds.x + currentDisplay.bounds.width - 540;
        }
        if (targetY < currentDisplay.bounds.y) targetY = currentDisplay.bounds.y + 20;
        if (targetY + 320 > currentDisplay.bounds.y + currentDisplay.bounds.height) {
            targetY = currentDisplay.bounds.y + currentDisplay.bounds.height - 340;
        }
        
        mainWindow.setPosition(Math.round(targetX), Math.round(targetY));
    } else {
        // 没存过，严格居中当前屏幕
        mainWindow.setPosition(
            Math.round(currentDisplay.bounds.x + (currentDisplay.bounds.width - 520) / 2),
            Math.round(currentDisplay.bounds.y + (currentDisplay.bounds.height - 320) / 2)
        );
    }
    setTimeout(() => { isSaving = false; }, 200);
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Option+Space', () => {
    // 如果当前是标签状态，直接恢复成大窗口
    if (currentTabWindow) {
        restoreFromTab();
        return;
    }

    if (mainWindow.isVisible()) {
      saveConfig();
      mainWindow.hide();
    } else {
      // 唤醒前，根据鼠标位置重新计算布局
      restoreLayout();
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  clearInterval(checkInterval);
  globalShortcut.unregisterAll();
});
