const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require('electron');
const Store = require('electron-store');
const store = new Store();

let mainWindow;

// 我们将在屏幕边缘创建隐藏的“触碰感应区”窗口
let edgeSensors = [];

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
  
  // 多屏连续性：如果之前存了坐标，直接恢复
  const savedBounds = store.get('windowBounds');
  if (savedBounds) {
    mainWindow.setBounds(savedBounds);
  }

  // 记住最后的移动位置
  mainWindow.on('moved', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  mainWindow.loadFile('index.html');
  if (app.dock) app.dock.hide();
  
  createEdgeSensors();
}

function createEdgeSensors() {
  const displays = screen.getAllDisplays();
  
  displays.forEach(display => {
    // 右边缘感应区
    let rightSensor = new BrowserWindow({
      x: display.bounds.x + display.bounds.width - 2,
      y: display.bounds.y,
      width: 2,
      height: display.bounds.height,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      hasShadow: false,
      focusable: false,
      skipTaskbar: true,
      webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    
    rightSensor.setIgnoreMouseEvents(true, { forward: true });
    
    // 【概念验证】当鼠标碰触右边缘时，如果是推拽状态，触发“变成标签”逻辑
    // 由于纯Node无法完美拦截macOS原生拖拽句柄，这里用鼠标位置做模拟触发
    setInterval(() => {
      let pt = screen.getCursorScreenPoint();
      if (pt.x >= display.bounds.x + display.bounds.width - 5) {
        // 如果按住了 Option 键并且靠边，模拟“吸附为标签”
        // console.log("Hit right edge of display", display.id);
      }
    }, 200);
    
    edgeSensors.push(rightSensor);
  });
}

app.whenReady().then(() => {
  createWindow();

  // 绑定全局快捷键
  globalShortcut.register('Option+Space', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      let point = screen.getCursorScreenPoint();
      let display = screen.getDisplayNearestPoint(point);
      
      // 检查当前显示器ID，如果发现更换了显示器，重置居中
      let lastDisplayId = store.get('lastDisplayId');
      if (lastDisplayId !== display.id) {
        let bounds = mainWindow.getBounds();
        let x = Math.round(display.bounds.x + (display.bounds.width - bounds.width) / 2);
        let y = Math.round(display.bounds.y + (display.bounds.height - bounds.height) / 2);
        mainWindow.setPosition(x, y);
        store.set('lastDisplayId', display.id);
      }
      
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
