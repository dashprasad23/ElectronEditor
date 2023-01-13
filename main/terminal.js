const { getMainWindow } = require("./windowMain");

const openTerminal =() => {
    getMainWindow().webContents.send("newTerminal",null);
}

const closeTerminal = () => {
    getMainWindow().webContents.send("closeTerminal",null);
}

module.exports ={
    openTerminal,
    closeTerminal
}