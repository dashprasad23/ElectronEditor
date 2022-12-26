const {Menu} = require('electron');
const { openFileModel} = require('./filesystem'); 
let menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
        },
        {
          label: "Open Folder",
          click:()=>{openFileModel() }
        },
        {
          label: "Save",
        }
      ],
    },
    {
      label: "Edit",
    },
    {
      label: "Window",
    },
    {
      label: "Terminal",
      click:()=>{}
    },
  ]);
  

  module.exports ={
      menu
  }