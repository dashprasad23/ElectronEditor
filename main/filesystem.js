const { getMainWindow } = require("./windowMain");
const fs = require("fs").promises;
const path = require("path");
const { dialog, ipcMain } = require("electron");


ipcMain.on("openDir", async (event, data) => {
  let path = data.path;
  let parentId = data.parentId
  const fileData = await readDir(path, parentId);
  event.reply("openDirReply", {data: fileData, parentId})
});

const openFileModel = async () => {
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then(async (data) => {
      let dirPath = data.filePaths[0];
      const fileData = await readDir(dirPath, null);
      getMainWindow().webContents.send("files", {data: fileData, parentId: null});
    });
};

async function readDir(dirPath, parentId) {
 const  files = await fs.readdir(dirPath);
 const fileData = await formatFile(files, dirPath, parentId);
 return fileData;
}

function formatFile(files, dirPath, parentId) {
  return new Promise((resolve, reject) => {
    let fileData = [];
    files.forEach(async (file, i) => {
      let filePath = path.resolve(dirPath, file);
      let stats = await fs.lstat(filePath);

      const data = {
        title: file,
        key: parentId?`${parentId}-${i}`:`0-${i}`,
        path: filePath,
      }
      if(stats.isFile()) {
        data['isLeaf'] = stats.isFile()
      } else {
        data['children'] = [];
      }

      fileData.push(data);
      if (i === files.length - 1) {
        resolve(fileData);
      }
    });
  });
}

module.exports = {
  openFileModel
};
