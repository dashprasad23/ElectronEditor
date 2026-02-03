const path = require('path');
const { ipcMain } = require('electron');
const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');
require("dotenv").config();
const { menu } = require("./../main/Menu");
const { saveData } = require("./../main/dataStore");
const { setMainWindow } = require("./../main/windowMain");
require("./../main/terminal");
require("./../main/filesystem");

ipcMain.on('store', (event, data) => {
  saveData(data.key, data.data)
})

// File read/write handlers
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('save-file', async (event, { path, content }) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(path, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 950,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });
  setMainWindow(win);
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'AppIcons/rounded_app_icon.png'));
  }
  win.setIcon(path.join(__dirname, 'AppIcons/rounded_app_icon.png'));

  // and load the index.html of the app.
  // win.loadFile("index.html");


  Menu.setApplicationMenu(menu);
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}


app.whenReady().then(() => {
  createWindow()
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
