import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classes from "./App.module.scss";
import Sidebar from "./Components/Sidebar";
import { Box, Typography, Paper } from "@mui/material";
import { FolderOpen, Terminal, Search } from "@mui/icons-material";
import { ResizeHorizon, Resize, ResizeVertical } from "react-resize-layout";
import CodeEditor from "./Components/CodeEditor/CodeEditor";
import TerminalContainer from "./Components/Terminal/TerminalContainer";
import { editorAction } from "./State/Editor";

const WelcomeScreen = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const handleOpenFolder = () => {
    window.main.ipcRenderer.send("open-folder-dialog");
  };

  const handleNewTerminal = () => {
    window.main.ipcRenderer.send("trigger-new-terminal");
  };

  return (
    <Box className={classes.WelcomeContainer}>
      <Box className={classes.WelcomeHero}>
        <Typography variant="h1" className={classes.HeroTitle}>
          Electron Editor
        </Typography>
        <Typography variant="h5" className={classes.HeroSubtitle}>
          Modern, lightweight, and extensible.
        </Typography>

        <Box className={classes.ActionCards}>
          <Paper elevation={0} className={classes.ActionCard} onClick={handleOpenFolder}>
            <FolderOpen className={classes.ActionIcon} />
            <Box textOverflow="ellipsis">
              <Typography variant="h6">Open Directory</Typography>
              <Typography variant="body2" color="textSecondary">Browse and open a project folder</Typography>
            </Box>
            <Typography variant="caption" className={classes.ShortcutLabel}>{modKey} + O</Typography>
          </Paper>

          <Paper elevation={0} className={classes.ActionCard} onClick={handleNewTerminal}>
            <Terminal className={classes.ActionIcon} />
            <Box>
              <Typography variant="h6">Terminal</Typography>
              <Typography variant="body2" color="textSecondary">Open a new integrated terminal</Typography>
            </Box>
            <Typography variant="caption" className={classes.ShortcutLabel}>{modKey} + T</Typography>
          </Paper>

          <Paper elevation={0} className={classes.ActionCard}>
            <Search className={classes.ActionIcon} />
            <Box>
              <Typography variant="h6">Search Files</Typography>
              <Typography variant="body2" color="textSecondary">Find files quickly in your workspace</Typography>
            </Box>
            <Typography variant="caption" className={classes.ShortcutLabel}>{modKey} + ⇧ + F</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

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

    window.main.ipcRenderer.on("files", handleFiles);
    window.main.ipcRenderer.on("openDirReply", handleOpenDirReply);
    window.main.ipcRenderer.on("newTerminal", handleNewTerminal);
    window.main.ipcRenderer.on("closeTerminal", handleCloseTerminal);

    return () => {
      window.main.ipcRenderer.removeListener("files", handleFiles);
      window.main.ipcRenderer.removeListener("openDirReply", handleOpenDirReply);
      window.main.ipcRenderer.removeListener("newTerminal", handleNewTerminal);
      window.main.ipcRenderer.removeListener("closeTerminal", handleCloseTerminal);
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
