const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path')

contextBridge.exposeInMainWorld('main', {
  fs: {...fs},
  fsPromis: {...fs.promises},
  ipcRenderer: {
    ...ipcRenderer,
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  },
  path: {...path},
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
})