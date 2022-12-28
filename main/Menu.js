const { Menu } = require("electron");
const { openFileModel } = require("./filesystem");
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
        label: "Save",
        accelerator: "Command+S",
      },
      {
        label: "Save All",
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
        label: "Edit",
        click: () =>{
          
        }
      },
      {
        label: "Delete",
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
      },
      {
        label: "Close All",
      },
    ],
  },
]);

module.exports = {
  menu,
};
