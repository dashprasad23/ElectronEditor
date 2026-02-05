import React, { useState, useEffect, SyntheticEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Box, Menu, MenuItem, Typography } from "@mui/material";
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
import FolderNav from "./FolderNavBar/FolderNav";
import FileOpsModel from "./FileOpsModel/FileOpsModel";

import { RootState } from "../../store";

const FolderList: React.FC = () => {
  const dispatch = useDispatch();
  const treeData = useSelector((state: any) => state.editor.treeData);
  const { theme } = useSelector((state: RootState) => state.settings);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // 'createFile', 'createFolder', 'rename'
  const [inputValue, setInputValue] = useState("");
  console.log(selectedNode);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Listen for operation success events to refresh the tree
  useEffect(() => {
    const handleOperationSuccess = (event: any, { type, parentPath }: { type: string, parentPath: string }) => {
      console.log(`Operation ${type} succeeded, refreshing ${parentPath}`);
      // Find the parent node and refresh it
      const findAndRefresh = (nodes: any[], targetPath: string): boolean => {
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

  const findNode = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.key === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleExpandedItemsChange = (event: SyntheticEvent | null, itemIds: string[]) => {
    const newlyExpanded = itemIds.find(id => !expandedItems.includes(id));
    setExpandedItems(itemIds);

    if (newlyExpanded) {
      const node = findNode(treeData, newlyExpanded);
      if (node && !node.isLeaf && (!node.children || node.children.length === 0)) {
        window.main.ipcRenderer.send("openDir", { path: node.path, parentId: node.key });
      }
    }
  };

  const handleSelect = (event: SyntheticEvent, nodeId: string) => {
    const node = findNode(treeData, nodeId);
    if (!node) return;
    setSelectedNode(node);

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
      }) as any);
    } else {
      // Toggle expansion manually for the content click
      const isExpanded = expandedItems.includes(nodeId);
      const newExpanded = isExpanded
        ? expandedItems.filter(id => id !== nodeId)
        : [...expandedItems, nodeId];
      handleExpandedItemsChange(event, newExpanded);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, node: any) => {
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

  const handleAction = (type: string) => {
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



  const renderTree = (nodes: any) => (
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
        ? nodes.children.map((node: any) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <>
      <FolderNav selectedNode={selectedNode} />
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
          {treeData.map((node: any) => renderTree(node))}
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
          PaperProps={{
            sx: {
              bgcolor: isDark ? '#1e1e1e' : 'background.paper',
              color: isDark ? '#fff' : 'text.primary',
              border: isDark ? '1px solid #333' : 'none',
              '& .MuiMenuItem-root': {
                '&:hover': {
                  bgcolor: isDark ? '#333' : 'rgba(0, 0, 0, 0.04)'
                }
              }
            }
          }}
        >
          {!selectedNode?.isLeaf && <MenuItem onClick={() => handleAction('createFile')}><NoteAdd sx={{ mr: 1, fontSize: 18, color: isDark ? '#fff' : 'inherit' }} /> New File</MenuItem>}
          {!selectedNode?.isLeaf && <MenuItem onClick={() => handleAction('createFolder')}><CreateNewFolder sx={{ mr: 1, fontSize: 18, color: isDark ? '#fff' : 'inherit' }} /> New Folder</MenuItem>}
          <MenuItem onClick={() => handleAction('rename')}><Edit sx={{ mr: 1, fontSize: 18, color: isDark ? '#fff' : 'inherit' }} /> Rename</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1, fontSize: 18 }} /> Delete</MenuItem>
        </Menu>

        <FileOpsModel
          modalVisible={modalVisible}
          setModalVisible={(data) => { setModalVisible(data) }}
          modalType={modalType}
          selectedNode={selectedNode}
          inputValue={inputValue}
          setInputValue={setInputValue} />
      </Box>
    </>

  );
};

export default FolderList;
