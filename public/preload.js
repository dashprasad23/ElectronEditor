const { contextBridge } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('main', {
  fs: () => fs
  // we can also expose variables, not just functions
})