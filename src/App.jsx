import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./App.module.scss";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import { Box } from "@mui/material";
import { ResizeHorizon, Resize, ResizeVertical } from "react-resize-layout";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import TerminalContainer from "./components/Terminal/TerminalContainer";
import { editorAction, saveCurrentFile } from "./store/editorSlice";


const App = () => {
  const [showTerminal, setTerminalStatus] = useState(false);
  const [collapsed] = useState(false);
  const [terminalCount, setTerminalCount] = useState(0)
  const isFolderOpen = useSelector((state) => state.editor.isFolderOpen);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleFiles = (event, resp) => {
      dispatch(editorAction.clear());
      if (resp.data) {
        dispatch(editorAction.setTreeData(resp.data));
        dispatch(editorAction.setFolderOpen(true));
      }
    };

    const handleOpenDirReply = (event, resp) => {
      dispatch(editorAction.updateTreeChildren({
        parentId: resp.path,
        children: resp.data
      }));
    };

    const handleNewTerminal = () => {
      setTerminalCount(prev => prev + 1);
      setTerminalStatus(true);
    };

    const handleCloseTerminal = () => {
      setTerminalStatus(false);
    };

    const handleSave = () => {
      dispatch(saveCurrentFile());
    };

    window.main.ipcRenderer.on("files", handleFiles);
    window.main.ipcRenderer.on("openDirReply", handleOpenDirReply);
    window.main.ipcRenderer.on("newTerminal", handleNewTerminal);
    window.main.ipcRenderer.on("closeTerminal", handleCloseTerminal);
    window.main.ipcRenderer.on("SAVE", handleSave);

    return () => {
      window.main.ipcRenderer.removeListener("files", handleFiles);
      window.main.ipcRenderer.removeListener("openDirReply", handleOpenDirReply);
      window.main.ipcRenderer.removeListener("newTerminal", handleNewTerminal);
      window.main.ipcRenderer.removeListener("closeTerminal", handleCloseTerminal);
      window.main.ipcRenderer.removeListener("SAVE", handleSave);
    };
  }, [dispatch]);

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Resize handleWidth="5px" handleColor="#1677ff">
        <ResizeVertical>
          {isFolderOpen ? (
            <Resize handleWidth="5px" handleColor="#1677ff">
              <ResizeHorizon width="300px" minWidth="200px" maxWidth="500px">
                <Sidebar collapsed={collapsed} />
              </ResizeHorizon>
              <ResizeHorizon minWidth="150px">
                <Box sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>
                  <CodeEditor />
                </Box>
              </ResizeHorizon>
            </Resize>
          ) : (
            <Box sx={{ height: '100%', width: '100%' }}>
              <WelcomeScreen />
            </Box>
          )}
        </ResizeVertical>
        {showTerminal && (
          <ResizeVertical minHeight="300px">
            <TerminalContainer terminalCount={terminalCount} />
          </ResizeVertical>
        )}
      </Resize>
    </div>
  );
};
export default App;
