import React, { useState } from 'react';
import { Tree } from 'antd';

import './FolderList.scss';
import {useDispatch} from "react-redux";
import {readFileData} from "../../State/Editor";

const { DirectoryTree } = Tree;

const FolderList = () => {
  const dispatch = useDispatch();
  const [treeData, setTreeData] = useState([]);

  window.main.ipcRenderer.on("files", (event, resp) => {
    setTreeData(resp.data);
  });

  window.main.ipcRenderer.on('openDirReply', (event, resp) => {
    const files = [...treeData];
    setTreeData(updateChildren(resp.parentId,resp.data,files));
  });

  const onSelect = (keys, info) => {
    const selectedFileData = {title:info.node.key,path: info.node.path,key: info.node.key};
    window.main.ipcRenderer.send('fileSelected', {data: selectedFileData});
    if(info.node.isLeaf) {
      openFileHandler({key:info.node.key, title: info.node.title, path: info.node.path});
    }
    
  };

  const openFileHandler = (fileData) => {
     console.log(fileData);
     dispatch(readFileData(fileData));
  }
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
         filesData[i].children = updateChildren(parentId, children, filesData[i].children);
         return filesData;
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
