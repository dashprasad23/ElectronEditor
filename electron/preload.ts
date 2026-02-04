import { contextBridge, ipcRenderer, globalShortcut } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';

contextBridge.exposeInMainWorld('main', {
  fs: { ...fs },
  fsPromis: { ...fs.promises },
  globalShortcut,
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, func),
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
    removeListener: (channel: string, func: (...args: any[]) => void) => ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
  },
  path: { ...path },
  os: {
    platform: os.platform(),
    homedir: os.homedir(),
  },
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
})