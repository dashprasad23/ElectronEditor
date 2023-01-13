const { Menu, ipcMain} = require("electron");
const { openFileModel } = require("./filesystem");
const {openTerminal, closeTerminal} = require('./terminal')

ipcMain.on('fileSelected', (event,data) => {
  menu.getMenuItemById('edit:edit').enabled = true;
  menu.getMenuItemById('edit:delete').enabled = true;
})

let menu = Menu.buildFromTemplate([
  {
    label: "",
    role: "TODO",
  },
  {
    label: "File",
    submenu: [
      {
        label: "New File",
      },
      {
        label: "New Folder",
      },
      {
        type: "separator",
      },
      {
        label: "Open File",
        accelerator: "Command+N",
      },
      {
        label: "Open Folder",
        click: () => {
          openFileModel();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Close",
        accelerator: "Command+W",
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        id: 'edit:edit',
        label: "Edit",
        click: () =>{
          
        },
        enabled: false
      },
      {
        id: 'edit:delete',
        label: "Delete",
        click: () => {

        },
        enabled: false
      },
      {
        type: "separator",
      },
      {
        label: "Cut",
        accelerator: "Command+X",
      },
      {
        label: "Copy",
        accelerator: "Command+C",
      },
      {
        label: "Pest",
        accelerator: "Command+V",
      },
      {
        type: "separator",
      },
      {
        label: "Settings..",
      },
    ],
  },
  {
    label: "Window",
    submenu: [
      {
        label: "New Window",
      },
      {
        label: "Close All",
      },
    ],
  },
  {
    label: "Terminal",
    submenu: [
      {
        label: "New Terminal",
        click: () => {
          openTerminal()
        }
      },
      {
        label: "Close All",
        click: () => {
          closeTerminal()
        }
      },
    ],
  },
]);

module.exports = {
  menu,
};
