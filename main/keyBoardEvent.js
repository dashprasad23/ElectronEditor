const {globalShortcut} = require('electron');
const {getMainWindow} = require("./windowMain");

const listenKeyBoardEvent = () => {
    watchSaveEvent()
}

const watchSaveEvent = () => {
    globalShortcut.register('CommandOrControl+S', () => {
        getMainWindow().webContents.send("SAVE",{});
    })
}



module.exports = {
    listenKeyBoardEvent
}

