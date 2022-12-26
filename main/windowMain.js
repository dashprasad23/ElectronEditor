const {BrowserWindow} = require('electron');
const getMainWindow = () => {
    const ID = 1;
    return BrowserWindow.fromId(ID)
  }


module.exports ={
    getMainWindow

}