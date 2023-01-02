const path = require('path');
const {ipcMain} = require('electron');
const { app, BrowserWindow, Menu} = require('electron');
const isDev = require('electron-is-dev');
require("dotenv").config();
const { menu } = require("./../main/Menu");
const { saveData } = require("./../main/dataStore");
const {listenKeyBoardEvent} = require("../main/keyBoardEvent");

ipcMain.on('store', (event,data) => {
  saveData(data.key,data.data)
})

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
  // win.setIcon(path.join(__dirname, '/public/appIcon.png'));

  // and load the index.html of the app.
  // win.loadFile("index.html");
  Menu.setApplicationMenu(menu);
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  listenKeyBoardEvent();
  // Open the DevTools.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);
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
