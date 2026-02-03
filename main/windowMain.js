const { BrowserWindow } = require('electron');

const getMainWindow = () => {
  const windows = BrowserWindow.getAllWindows();
  return windows.length > 0 ? windows[0] : null;
};

// Kept for backward compatibility if needed during migration, but no longer used for storage
const setMainWindow = (win) => { };

module.exports = {
  getMainWindow,
  setMainWindow
};