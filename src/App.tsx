import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import { Box } from "@mui/material";
import { ResizeHorizon, Resize, ResizeVertical } from "react-resize-layout";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import TerminalContainer from "./components/Terminal/TerminalContainer";
import { editorAction, saveCurrentFile } from "./store/editorSlice";
import Footer from "./components/Footer/Footer";
import { AppDispatch } from "./store";
import SettingsModal from "./components/Settings/SettingsModal";
import { settingsAction } from "./store/settingsSlice";
import SearchModal from "./components/Search/SearchModal";
import { searchAction } from "./store/searchSlice";


import TitleBar from "./components/TitleBar/TitleBar";

const App: React.FC = () => {
  const [showTerminal, setTerminalStatus] = useState(false);
  const [terminalCount, setTerminalCount] = useState(0)
  const isFolderOpen = useSelector((state: any) => state.editor.isFolderOpen);
  const { theme, fontSize } = useSelector((state: any) => state.settings);
  const dispatch = useDispatch<AppDispatch>();
  const [isSettingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { ipcRenderer } = window.main;
        const storedTheme = await ipcRenderer.invoke('settings:get', 'theme');
        const storedFontSize = await ipcRenderer.invoke('settings:get', 'fontSize');

        if (storedTheme || storedFontSize) {
          dispatch(settingsAction.setSettings({
            theme: storedTheme || 'system',
            fontSize: storedFontSize || 14
          }));
        }
        setSettingsLoaded(true);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettingsLoaded(true); // Enable saving even if load fails to avoid stuck state
      }
    };
    loadSettings();
  }, [dispatch]);

  useEffect(() => {
    // Save settings on change
    if (!isSettingsLoaded) return;

    const saveSettings = async () => {
      const { ipcRenderer } = window.main;
      await ipcRenderer.invoke('settings:set', { key: 'theme', value: theme });
      await ipcRenderer.invoke('settings:set', { key: 'fontSize', value: fontSize });
    };
    saveSettings();
  }, [theme, fontSize, isSettingsLoaded]);

  useEffect(() => {
    const handleFiles = async (event: any, resp: any) => {
      dispatch(editorAction.clear());
      if (resp.data) {
        dispatch(editorAction.setTreeData(resp.data));
        dispatch(editorAction.setFolderOpen(true));
        // Extract folder name from path (handling both windows/unix separators)
        const separator = resp.path.includes("\\") ? "\\" : "/";
        const folderName = resp.path.split(separator).pop() || resp.path;
        dispatch(editorAction.setRootDirectoryName(folderName));

        // Get git branch
        try {
          const branch = await window.main.ipcRenderer.invoke('git:get-branch', resp.path);
          dispatch(editorAction.setGitBranch(branch));
        } catch (error) {
          console.error("Failed to get git branch:", error);
          dispatch(editorAction.setGitBranch(null));
        }
      }
    };

    const handleOpenDirReply = (event: any, resp: any) => {
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

    const handleOpenSettings = () => {
      dispatch(settingsAction.setSettingsOpen(true));
    }

    const handleOpenSearch = () => {
      dispatch(searchAction.setSearchOpen(true));
    }

    const { ipcRenderer } = window.main;
    ipcRenderer.on("files", handleFiles);
    ipcRenderer.on("openDirReply", handleOpenDirReply);
    ipcRenderer.on("newTerminal", handleNewTerminal);
    ipcRenderer.on("closeTerminal", handleCloseTerminal);
    ipcRenderer.on("SAVE", handleSave);
    ipcRenderer.on("menu:open-settings", handleOpenSettings);
    ipcRenderer.on("menu:find", handleOpenSearch);

    return () => {
      ipcRenderer.removeListener("files", handleFiles);
      ipcRenderer.removeListener("openDirReply", handleOpenDirReply);
      ipcRenderer.removeListener("newTerminal", handleNewTerminal);
      ipcRenderer.removeListener("closeTerminal", handleCloseTerminal);
      ipcRenderer.removeListener("SAVE", handleSave);
      ipcRenderer.removeListener("menu:open-settings", handleOpenSettings);
      ipcRenderer.removeListener("menu:find", handleOpenSearch);
    };
  }, [dispatch]);

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <TitleBar />
      <div style={{ flex: 1, overflow: "hidden", position: 'relative' }}>
        <Resize handleWidth="5px" handleColor="#1677ff" height="100%">
          <ResizeVertical>
            {isFolderOpen ? (
              <Resize handleWidth="5px" handleColor="#1677ff" height="100%">
                <ResizeHorizon width="300px" minWidth="200px" maxWidth="500px">
                  <Sidebar />
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
        <SettingsModal />
        <SearchModal />
      </div>
      <Footer />
    </div>
  );
};
export default App;
