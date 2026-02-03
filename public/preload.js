const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { globalShortcut } = require('electron');

contextBridge.exposeInMainWorld('main', {
  fs: { ...fs },
  fsPromis: { ...fs.promises },
  globalShortcut,
  ipcRenderer: {
    on: (channel, func) => ipcRenderer.on(channel, func),
    send: (channel, data) => ipcRenderer.send(channel, data),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  },
  path: { ...path },
  os: {
    platform: os.platform(),
    homedir: os.homedir(),
  },
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
})