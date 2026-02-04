import { BrowserWindow } from 'electron';

export const getMainWindow = (): BrowserWindow | null => {
  const windows = BrowserWindow.getAllWindows();
  return windows.length > 0 ? windows[0] : null;
};

// Kept for backward compatibility if needed during migration, but no longer used for storage
export const setMainWindow = (win: BrowserWindow) => { };