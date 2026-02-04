import { getMainWindow } from "./windowMain";
import fs from "fs";
import path from "path";
import { dialog, ipcMain, IpcMainEvent } from "electron";
import { setCurrentWorkspace } from "./dataStore";

const fsPromises = fs.promises;

ipcMain.on("openDir", async (event: IpcMainEvent, data: any) => {
  let path = data.path;
  let parentId = data.parentId
  const fileData = await readDir(path, parentId);
  event.reply("openDirReply", { data: fileData, parentId, path })
});

ipcMain.on("open-folder-dialog", (event, workspacePath) => {
  openFileModel(workspacePath);
});

ipcMain.on("createFile", async (event, data) => {
  try {
    const filePath = path.join(data.parentPath, data.name);
    await fsPromises.writeFile(filePath, "");
    event.reply("operationSuccess", { type: "createFile", parentPath: data.parentPath });
  } catch (error: any) {
    console.error("Failed to create file", error);
    event.reply("operationError", { error: error.message });
  }
});

ipcMain.on("createFolder", async (event, data) => {
  try {
    const folderPath = path.join(data.parentPath, data.name);
    await fsPromises.mkdir(folderPath);
    event.reply("operationSuccess", { type: "createFolder", parentPath: data.parentPath });
  } catch (error: any) {
    console.error("Failed to create folder", error);
    event.reply("operationError", { error: error.message });
  }
});

ipcMain.on("renamePath", async (event, data) => {
  try {
    await fsPromises.rename(data.oldPath, data.newPath);
    // Refresh parent of oldPath basically
    event.reply("operationSuccess", { type: "rename", parentPath: path.dirname(data.oldPath) });
  } catch (error: any) {
    console.error("Failed to rename", error);
    event.reply("operationError", { error: error.message });
  }
});

ipcMain.on("deletePath", async (event, data) => {
  try {
    if (data.isDirectory) {
      await fsPromises.rm(data.path, { recursive: true, force: true });
    } else {
      await fsPromises.unlink(data.path);
    }
    event.reply("operationSuccess", { type: "delete", parentPath: path.dirname(data.path) });
  } catch (error: any) {
    console.error("Failed to delete", error);
    event.reply("operationError", { error: error.message });
  }
});

export const openFileModel = async (workspacePath?: string) => {
  // If a workspace path is provided, use it directly
  if (workspacePath) {
    try {
      // Save the workspace path to persistent storage
      setCurrentWorkspace(workspacePath);

      const fileData = await readDir(workspacePath, null);
      getMainWindow()?.webContents.send("files", { data: fileData, parentId: null });
    } catch (error) {
      console.error('Error opening workspace:', error);
    }
    return;
  }

  // Otherwise, show the dialog
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then(async (data) => {
      if (data.canceled) return;
      let dirPath = data.filePaths[0];

      // Save the workspace path to persistent storage
      setCurrentWorkspace(dirPath);

      const fileData = await readDir(dirPath, null);
      getMainWindow()?.webContents.send("files", { data: fileData, parentId: null });
    });
};

async function readDir(dirPath: string, parentId: string | null) {
  const files = await fsPromises.readdir(dirPath);
  const fileData = await formatFile(files, dirPath, parentId);
  return fileData;
}

function formatFile(files: string[], dirPath: string, parentId: string | null) {
  return Promise.all(
    files.map(async (file, i) => {
      let filePath = path.resolve(dirPath, file);
      // use lstat from promises
      let stats = await fsPromises.lstat(filePath);

      const data: any = {
        title: file,
        key: parentId ? `${parentId}-${i}` : `0-${i}`,
        path: filePath,
      };
      if (stats.isFile()) {
        data['isLeaf'] = true;
      } else {
        data['children'] = [];
      }
      return { ...data, isDirectory: stats.isDirectory() };
    })
  ).then((fileData) => {
    // Sort: folders first, then files, both alphabetically
    fileData.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });
    // Remove helper property before returning
    return fileData.map(({ isDirectory, ...rest }) => rest);
  });
}
