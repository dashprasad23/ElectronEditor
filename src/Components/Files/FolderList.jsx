import React, { useState, useEffect } from "react";
import { Tree, Menu, Modal, Input, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import "./FolderList.scss";
import { useDispatch } from "react-redux";
import { editorAction, readFileData } from "../../State/Editor";

const { DirectoryTree } = Tree;
const { confirm } = Modal;

const FolderList = () => {
  const dispatch = useDispatch();
  const [treeData, setTreeData] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // 'createFile', 'createFolder', 'rename'
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handleFiles = (event, resp) => {
      dispatch(editorAction.clear());
      if (resp.data) {
        setTreeData(resp.data);
      }
    };

    const handleOpenDirReply = (event, resp) => {
      setTreeData((prevData) => {
        if (!prevData) return [];
        return updateChildren(resp.path, resp.data, [...prevData]);
      });
    };

    const handleOperationSuccess = (event, data) => {
      message.success("Operation successful");
      // Refresh the parent folder
      if (data.parentPath) {
        refreshNode(data.parentPath);
      }
    };

    const handleOperationError = (event, data) => {
      message.error(data.error || "Operation failed");
    };

    window.main.ipcRenderer.on("files", handleFiles);
    window.main.ipcRenderer.on("openDirReply", handleOpenDirReply);
    window.main.ipcRenderer.on("operationSuccess", handleOperationSuccess);
    window.main.ipcRenderer.on("operationError", handleOperationError);

    return () => {
      window.main.ipcRenderer.removeListener("files", handleFiles);
      window.main.ipcRenderer.removeListener("openDirReply", handleOpenDirReply);
      window.main.ipcRenderer.removeListener("operationSuccess", handleOperationSuccess);
      window.main.ipcRenderer.removeListener("operationError", handleOperationError);
    };
  }, [dispatch]);

  const refreshNode = (path) => {
    // We need to find the node key for this path to properly refresh it via openDir
    // Helper to traverse and find
    const findNodeKey = (nodes) => {
      for (let node of nodes) {
        if (node.path === path) return node.key;
        if (node.children) {
          const found = findNodeKey(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    // If path is root (or not found in tree, maybe it's the root dir itself?), we might need a full reload or handle it differently
    // Actually typically we want to refresh the FOLDER that contains the changes.
    // If we renamed a file, 'parentPath' is the containing folder.

    // Using a functional update to get current treeData
    setTreeData(currentTree => {
      const key = findNodeKey(currentTree);
      if (key) {
        window.main.ipcRenderer.send("openDir", { path: path, parentId: key });
      } else {
        // If we can't find the key, maybe it's the root loaded via openFileModel?
        // But openFileModel reloads everything.
        // For now, if we can't find it, we might just ignore or user has to reload.
        // But usually parentPath should be in the tree if we just clicked inside it.
      }
      return currentTree;
    });
  };

  const onSelect = (keys, info) => {
    const selectedFileData = {
      title: info.node.key,
      path: info.node.path,
      key: info.node.key,
    };
    // Note: 'fileSelected' IPC was used for menu enabling in main process, keeping it.
    window.main.ipcRenderer.send("fileSelected", { data: selectedFileData });

    if (info.node.isLeaf) {
      dispatch(readFileData({
        key: info.node.key,
        title: info.node.title,
        path: info.node.path,
      }));
    }
  };

  const onExpand = (keys, info) => {
    const id = info.node.key;
    const dirPath = info.node.path;
    if (!info.node.children || info.node.children.length === 0) {
      window.main.ipcRenderer.send("openDir", { path: dirPath, parentId: id });
    }
  };

  const updateChildren = (parentId, children, filesData) => {
    return filesData.map(node => {
      if (node.path === parentId) {
        return { ...node, children: children };
      } else if (node.children && parentId.startsWith(node.path)) {
        return { ...node, children: updateChildren(parentId, children, node.children) };
      }
      return node;
    });
  };

  // Context menu logic
  const onRightClick = ({ event, node }) => {
    event.preventDefault();
    setSelectedNode(node);
    setContextMenu({
      pageX: event.pageX,
      pageY: event.pageY,
      visible: true,
      isLeaf: node.isLeaf
    });
  };

  const handleMenuClick = ({ key }) => {
    setContextMenu(null);
    setInputValue("");

    if (key === "addFile") {
      setModalType("createFile");
      setModalVisible(true);
    } else if (key === "addFolder") {
      setModalType("createFolder");
      setModalVisible(true);
    } else if (key === "rename") {
      setModalType("rename");
      setInputValue(selectedNode.title);
      setModalVisible(true);
    } else if (key === "delete") {
      showDeleteConfirm();
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: `Are you sure you want to delete ${selectedNode.title}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      onOk() {
        window.main.ipcRenderer.send("deletePath", {
          path: selectedNode.path,
          isDirectory: !selectedNode.isLeaf
        });
      },
      onCancel() { },
    });
  };

  const handleModalOk = () => {
    if (!inputValue) return;

    if (modalType === "createFile") {
      window.main.ipcRenderer.send("createFile", { parentPath: selectedNode.path, name: inputValue });
    } else if (modalType === "createFolder") {
      window.main.ipcRenderer.send("createFolder", { parentPath: selectedNode.path, name: inputValue });
    } else if (modalType === "rename") {
      // New path construction needs to be careful about parent directory
      // selectedNode.path is the full path. We need to replace the filename.
      // Since we don't have 'path.dirname' here easily unless we strip string.
      // BUT, we know selectedNode.path. 
      // Wait, 'path' module is exposed in preload as 'window.main.path'.
      // Let's use that if available, or simple string manipulation.
      // preload.js exposes 'path' as {...path}, let's assum window.main.path.dirname works?
      // Actually preload says: path: {...path}. So yes.

      if (window.main.path && window.main.path.dirname && window.main.path.join) {
        const parentDir = window.main.path.dirname(selectedNode.path);
        const newPath = window.main.path.join(parentDir, inputValue);
        window.main.ipcRenderer.send("renamePath", { oldPath: selectedNode.path, newPath: newPath });
      } else {
        // Fallback if path not fully exposed (but it looked like it was)
        // simplified fallback (might be buggy with separators on windows vs mac)
        const separator = selectedNode.path.includes("\\") ? "\\" : "/";
        const parentDir = selectedNode.path.substring(0, selectedNode.path.lastIndexOf(separator));
        const newPath = parentDir + separator + inputValue;
        window.main.ipcRenderer.send("renamePath", { oldPath: selectedNode.path, newPath: newPath });
      }
    }

    setModalVisible(false);
    setInputValue("");
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {!contextMenu?.isLeaf && <Menu.Item key="addFile">New File</Menu.Item>}
      {!contextMenu?.isLeaf && <Menu.Item key="addFolder">New Folder</Menu.Item>}
      <Menu.Item key="rename">Rename</Menu.Item>
      <Menu.Item key="delete" danger>Delete</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ position: "relative", height: "100%" }} onClick={() => setContextMenu(null)}>
      <DirectoryTree
        multiple
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        treeData={treeData}
        onRightClick={onRightClick}
      />
      {contextMenu && contextMenu.visible && (
        <div
          style={{
            position: "fixed",
            left: contextMenu.pageX,
            top: contextMenu.pageY,
            zIndex: 9999,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: 4,
            minWidth: 150,
            border: "1px solid #eee"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu}
        </div>
      )}
      <Modal
        title={
          modalType === 'createFile' ? "New File" :
            modalType === 'createFolder' ? "New Folder" : "Rename"
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Input
          placeholder="Enter name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleModalOk}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default FolderList;
