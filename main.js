const { app, BrowserWindow, globalShortcut, screen } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,  // 让窗口完全等于UI的尺寸
    height: 320, 
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: true, // 【核心】：开启 macOS 原生阴影，不要用 CSS 阴影
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  mainWindow.loadFile('index.html');
  
  if (app.dock) app.dock.hide();
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('Option+Space', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      let point = screen.getCursorScreenPoint();
      let display = screen.getDisplayNearestPoint(point);
      let bounds = mainWindow.getBounds();
      let x = Math.round(display.bounds.x + (display.bounds.width - bounds.width) / 2);
      let y = Math.round(display.bounds.y + (display.bounds.height - bounds.height) / 2);
      
      mainWindow.setPosition(x, y);
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
