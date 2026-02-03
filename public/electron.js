const path = require('path');
const { ipcMain } = require('electron');
const { app, BrowserWindow, Menu } = require('electron');
const isDev = require('electron-is-dev');
require("dotenv").config();
const { menu } = require("./../main/Menu");
const {
  saveData,
  getData,
  deleteData,
  setCurrentWorkspace,
  getCurrentWorkspace,
  clearCurrentWorkspace,
  getRecentWorkspaces,
  addRecentFile,
  getRecentFiles,
  setEditorSetting,
  getEditorSetting,
  getAllData
} = require("./../main/dataStore");
const { setMainWindow } = require("./../main/windowMain");
require("./../main/terminal");
require("./../main/filesystem");

// Generic storage handlers
ipcMain.handle('store:set', async (event, { key, value }) => {
  saveData(key, value);
  return { success: true };
});

ipcMain.handle('store:get', async (event, key) => {
  return getData(key);
});

ipcMain.handle('store:delete', async (event, key) => {
  deleteData(key);
  return { success: true };
});

// Workspace handlers
ipcMain.handle('workspace:set-current', async (event, path) => {
  setCurrentWorkspace(path);
  return { success: true };
});

ipcMain.handle('workspace:get-current', async () => {
  return getCurrentWorkspace();
});

ipcMain.handle('workspace:get-recent', async () => {
  return getRecentWorkspaces();
});

ipcMain.handle('workspace:close', async (event) => {
  clearCurrentWorkspace();
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.webContents.send('workspace-closed');
  }
  return { success: true };
});


// Recent files handlers
ipcMain.handle('files:add-recent', async (event, filePath) => {
  addRecentFile(filePath);
  return { success: true };
});

ipcMain.handle('files:get-recent', async () => {
  return getRecentFiles();
});

// Editor settings handlers
ipcMain.handle('settings:set', async (event, { key, value }) => {
  setEditorSetting(key, value);
  return { success: true };
});

ipcMain.handle('settings:get', async (event, key) => {
  return getEditorSetting(key);
});

// Debug handler
ipcMain.handle('store:get-all', async () => {
  return getAllData();
});

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
