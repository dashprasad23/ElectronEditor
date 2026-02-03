const { getMainWindow } = require("./windowMain");
const fs = require("fs").promises;
const path = require("path");
const { dialog, ipcMain } = require("electron");


ipcMain.on("openDir", async (event, data) => {
  let path = data.path;
  let parentId = data.parentId
  const fileData = await readDir(path, parentId);
  event.reply("openDirReply", { data: fileData, parentId, path })
});

ipcMain.on("open-folder-dialog", () => {
  openFileModel();
});

ipcMain.on("createFile", async (event, data) => {
  try {
    const filePath = path.join(data.parentPath, data.name);
    await fs.writeFile(filePath, "");
    event.reply("operationSuccess", { type: "createFile", parentPath: data.parentPath });
  } catch (error) {
    console.error("Failed to create file", error);
    event.reply("operationError", { error: error.message });
  }
});

ipcMain.on("createFolder", async (event, data) => {
  try {
    const folderPath = path.join(data.parentPath, data.name);
    await fs.mkdir(folderPath);
    event.reply("operationSuccess", { type: "createFolder", parentPath: data.parentPath });
  } catch (error) {
    console.error("Failed to create folder", error);
    event.reply("operationError", { error: error.message });
  }
});

ipcMain.on("renamePath", async (event, data) => {
  try {
    await fs.rename(data.oldPath, data.newPath);
    // Refresh parent of oldPath basically
    event.reply("operationSuccess", { type: "rename", parentPath: path.dirname(data.oldPath) });
  } catch (error) {
    console.error("Failed to rename", error);
    event.reply("operationError", { error: error.message });
  }
});

ipcMain.on("deletePath", async (event, data) => {
  try {
    if (data.isDirectory) {
      await fs.rm(data.path, { recursive: true, force: true });
    } else {
      await fs.unlink(data.path);
    }
    event.reply("operationSuccess", { type: "delete", parentPath: path.dirname(data.path) });
  } catch (error) {
    console.error("Failed to delete", error);
    event.reply("operationError", { error: error.message });
  }
});

const openFileModel = async () => {
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then(async (data) => {
      if (data.canceled) return;
      let dirPath = data.filePaths[0];
      const fileData = await readDir(dirPath, null);
      getMainWindow().webContents.send("files", { data: fileData, parentId: null });
    });
};

async function readDir(dirPath, parentId) {
  const files = await fs.readdir(dirPath);
  const fileData = await formatFile(files, dirPath, parentId);
  return fileData;
}

function formatFile(files, dirPath, parentId) {
  return Promise.all(
    files.map(async (file, i) => {
      let filePath = path.resolve(dirPath, file);
      let stats = await fs.lstat(filePath);

      const data = {
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

module.exports = {
  openFileModel
};
