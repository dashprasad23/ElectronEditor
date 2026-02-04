import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Box, Menu, MenuItem, Modal, TextField, Button, Typography } from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  Folder,
  CreateNewFolder,
  NoteAdd,
  Edit,
  Delete
} from "@mui/icons-material";
import { readFileData } from "../../store/editorSlice";
import FileIcon from "../FileIcon/FileIcon";
import style from "./FolderList.module.scss"
import FolderNav from "./FolderNavBar/FoderNav";

const FolderList = () => {
  const dispatch = useDispatch();
  const treeData = useSelector((state) => state.editor.treeData);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // 'createFile', 'createFolder', 'rename'
  const [inputValue, setInputValue] = useState("");


  const [expandedItems, setExpandedItems] = useState([]);

  // Listen for operation success events to refresh the tree
  useEffect(() => {
    const handleOperationSuccess = (event, { type, parentPath }) => {
      console.log(`Operation ${type} succeeded, refreshing ${parentPath}`);
      // Find the parent node and refresh it
      const findAndRefresh = (nodes, targetPath) => {
        for (const node of nodes) {
          if (node.path === targetPath) {
            // Refresh this directory
            window.main.ipcRenderer.send("openDir", { path: node.path, parentId: node.key });
            return true;
          }
          if (node.children && findAndRefresh(node.children, targetPath)) {
            return true;
          }
        }
        return false;
      };

      findAndRefresh(treeData, parentPath);
    };

    window.main.ipcRenderer.on("operationSuccess", handleOperationSuccess);

    return () => {
      window.main.ipcRenderer.removeListener("operationSuccess", handleOperationSuccess);
    };
  }, [treeData]);

  const findNode = (nodes, id) => {
    for (const node of nodes) {
      if (node.key === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleExpandedItemsChange = (event, itemIds) => {
    const newlyExpanded = itemIds.find(id => !expandedItems.includes(id));
    setExpandedItems(itemIds);

    if (newlyExpanded) {
      const node = findNode(treeData, newlyExpanded);
      if (node && !node.isLeaf && (!node.children || node.children.length === 0)) {
        window.main.ipcRenderer.send("openDir", { path: node.path, parentId: node.key });
      }
    }
  };

  const handleSelect = (event, nodeId) => {
    const node = findNode(treeData, nodeId);
    if (!node) return;

    if (node.isLeaf) {
      const selectedFileData = {
        title: node.key,
        path: node.path,
        key: node.key,
      };
      window.main.ipcRenderer.send("fileSelected", { data: selectedFileData });
      dispatch(readFileData({
        key: node.key,
        title: node.title,
        path: node.path,
      }));
    } else {
      // Toggle expansion manually for the content click
      const isExpanded = expandedItems.includes(nodeId);
      const newExpanded = isExpanded
        ? expandedItems.filter(id => id !== nodeId)
        : [...expandedItems, nodeId];
      handleExpandedItemsChange(event, newExpanded);
    }
  };

  const handleContextMenu = (event, node) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedNode(node);
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 4,
        }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleAction = (type) => {
    handleClose();
    setModalType(type);
    if (type === 'rename') {
      setInputValue(selectedNode.title);
    } else {
      setInputValue("");
    }
    setModalVisible(true);
  };

  const handleDelete = () => {
    handleClose();
    if (window.confirm(`Are you sure you want to delete ${selectedNode.title}?`)) {
      window.main.ipcRenderer.send("deletePath", {
        path: selectedNode.path,
        isDirectory: !selectedNode.isLeaf
      });
    }
  };

  const handleModalSubmit = () => {
    if (!inputValue) return;

    if (modalType === "createFile") {
      window.main.ipcRenderer.send("createFile", { parentPath: selectedNode.path, name: inputValue });
    } else if (modalType === "createFolder") {
      window.main.ipcRenderer.send("createFolder", { parentPath: selectedNode.path, name: inputValue });
    } else if (modalType === "rename") {
      const separator = selectedNode.path.includes("\\") ? "\\" : "/";
      const parentDir = selectedNode.path.substring(0, selectedNode.path.lastIndexOf(separator));
      const newPath = parentDir + separator + inputValue;
      window.main.ipcRenderer.send("renamePath", { oldPath: selectedNode.path, newPath: newPath });
    }

    setModalVisible(false);
    setInputValue("");
  };

  const renderTree = (nodes) => (
    <TreeItem
      key={nodes.key}
      itemId={nodes.key}
      label={
        <Box
          onContextMenu={(e) => handleContextMenu(e, nodes)}
          sx={{ display: 'flex', alignItems: 'center', p: '2px 0' }}
        >
          {nodes.isLeaf ? (
            <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
              <FileIcon fileName={nodes.title} size={16} />
            </Box>
          ) : (
            <Folder sx={{ fontSize: 16, mr: 0.5, color: '#1677ff' }} />
          )}
          <Typography variant="caption" sx={{ fontWeight: 'inherit', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
            {nodes.title}
          </Typography>
        </Box>
      }
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <>
      <FolderNav />
      <Box className={style.folderList}>
        <SimpleTreeView
          aria-label="file system navigator"
          slots={{
            collapseIcon: ExpandMore,
            expandIcon: ChevronRight,
          }}
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          onItemClick={handleSelect}
          expansionTrigger="iconContainer"
          sx={{ flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
        >
          {treeData.map((node) => renderTree(node))}
        </SimpleTreeView>

        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          {!selectedNode?.isLeaf && <MenuItem onClick={() => handleAction('createFile')}><NoteAdd sx={{ mr: 1, fontSize: 18 }} /> New File</MenuItem>}
          {!selectedNode?.isLeaf && <MenuItem onClick={() => handleAction('createFolder')}><CreateNewFolder sx={{ mr: 1, fontSize: 18 }} /> New Folder</MenuItem>}
          <MenuItem onClick={() => handleAction('rename')}><Edit sx={{ mr: 1, fontSize: 18 }} /> Rename</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1, fontSize: 18 }} /> Delete</MenuItem>
        </Menu>

        <Modal
          open={modalVisible}
          onClose={() => setModalVisible(false)}
          aria-labelledby="modal-modal-title"
        >
          <Box className={style.actionModel}>
            <Typography id="modal-modal-title" variant="h6" component="h5" gutterBottom>
              {modalType === 'createFile' ? "New File" : modalType === 'createFolder' ? "New Folder" : "Rename"}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              size="small"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setModalVisible(false)} variant="text" size="small">Cancel</Button>
              <Button onClick={handleModalSubmit} variant="contained" size="small">Confirm</Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </>

  );
};

export default FolderList;
