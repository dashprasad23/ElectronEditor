const {BrowserWindow} = require('electron');
const getMainWindow = () => {
    const ID = 2;
    return BrowserWindow.fromId(ID)
  }


module.exports ={
    getMainWindow

}