import React, { useState } from 'react';
import { Tree } from 'antd';

import './FolderList.scss';

const { DirectoryTree } = Tree;

const FolderList = () => {

  const [treeData, setTreeData] = useState([]);

  window.main.ipcRenderer.on("files", (event, resp) => {
    setTreeData(resp.data);
  });

  window.main.ipcRenderer.on('openDirReply', (event, resp) => {

    const files = [...treeData];
    console.log(updateChildren(resp.parentId,resp.data,files));
  });

  const onSelect = (keys, info) => {
    
  };
  const onExpand = async (keys, info) => {
    const id = info.node.key;
    const dirPath = info.node.path;
    if(info.node.children.length === 0) {
    window.main.ipcRenderer.send('openDir',{path: dirPath, parentId: id});
   }};

  const updateChildren = (parentId, children, filesData) => {
    
    for(let i=0; i<filesData.length; i++) {
      if(filesData[i].key === parentId) {
        filesData[i].children = children
        return filesData;
      } else if(parentId.startsWith(filesData[i].key)){
         return updateChildren(parentId, children, filesData[i].children);
        }
    }
 
  }





  return (
    <DirectoryTree
      multiple
      defaultExpandAll
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
    />
  );
};
export default FolderList;