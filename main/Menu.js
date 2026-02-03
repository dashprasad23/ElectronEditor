const { Menu, ipcMain, app } = require("electron");
const { openFileModel } = require("./filesystem");
const { openTerminal, closeTerminal } = require('./terminal');
const { getMainWindow } = require("./windowMain");

ipcMain.on('fileSelected', (event, data) => {
  const editMenu = Menu.getApplicationMenu().getMenuItemById('edit-menu');
  if (editMenu) {
    // Note: In some versions of Electron, you can't easily enable/disable top-level items dynamically without rebuilding the menu
    // But we can enable/disable sub-items.
  }
})

const isMac = process.platform === 'darwin';

const template = [
  ...(isMac ? [{
    label: "Antigravity",
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: "File",
    submenu: [
      {
        label: "New File",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          // TODO: Implement new file creation logic
        }
      },
      {
        label: "New Folder",
        accelerator: "CmdOrCtrl+Shift+N",
        click: () => {
          // TODO: Implement new folder creation logic
        }
      },
      {
        type: "separator",
      },
      {
        label: "Open Folder",
        accelerator: "CmdOrCtrl+O",
        click: () => {
          openFileModel();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Save",
        accelerator: "CmdOrCtrl+S",
        click: () => {
          const win = getMainWindow();
          if (win) {
            win.webContents.send("SAVE");
          }
        }
      },
      {
        type: "separator",
      },
      {
        label: "Close Window",
        accelerator: "CmdOrCtrl+W",
        role: "close"
      },
    ],
  },
  {
    label: "Edit",
    id: 'edit-menu',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ],
  },
  {
    label: "Terminal",
    submenu: [
      {
        label: "New Terminal",
        accelerator: "CmdOrCtrl+T",
        click: () => {
          openTerminal()
        }
      },
      {
        label: "Close All Terminals",
        click: () => {
          closeTerminal()
        }
      },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: "Window",
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
];

let menu = Menu.buildFromTemplate(template);

module.exports = {
  menu,
};
