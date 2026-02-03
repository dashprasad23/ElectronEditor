import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Box, Menu, MenuItem, Modal, TextField, Button, Typography } from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  InsertDriveFile,
  Folder,
  CreateNewFolder,
  NoteAdd,
  Edit,
  Delete
} from "@mui/icons-material";
import { readFileData } from "../../State/Editor";

const FolderList = () => {
  const dispatch = useDispatch();
  const treeData = useSelector((state) => state.editor.treeData);

  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // 'createFile', 'createFolder', 'rename'
  const [inputValue, setInputValue] = useState("");


  const handleSelect = (event, nodeId) => {
    // Find node in treeData
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

    const node = findNode(treeData, nodeId);
    if (node) {
      const selectedFileData = {
        title: node.key,
        path: node.path,
        key: node.key,
      };
      window.main.ipcRenderer.send("fileSelected", { data: selectedFileData });

      if (node.isLeaf) {
        dispatch(readFileData({
          key: node.key,
          title: node.title,
          path: node.path,
        }));
      } else {
        // Expand folder
        if (!node.children || node.children.length === 0) {
          window.main.ipcRenderer.send("openDir", { path: node.path, parentId: node.key });
        }
      }
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
          {nodes.isLeaf ? <InsertDriveFile sx={{ fontSize: 16, mr: 0.5, color: '#666' }} /> : <Folder sx={{ fontSize: 16, mr: 0.5, color: '#1677ff' }} />}
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
    <Box sx={{ height: '100%', width: '100%' }}>
      <SimpleTreeView
        aria-label="file system navigator"
        slots={{
          collapseIcon: ExpandMore,
          expandIcon: ChevronRight,
        }}
        onItemClick={handleSelect}
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
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            {modalType === 'createFile' ? "New File" : modalType === 'createFolder' ? "New Folder" : "Rename"}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            variant="outlined"
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setModalVisible(false)} variant="text">Cancel</Button>
            <Button onClick={handleModalSubmit} variant="contained">Confirm</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FolderList;
