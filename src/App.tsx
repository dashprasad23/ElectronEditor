import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen/WelcomeScreen";
import { Box } from "@mui/material";
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

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 500;
const EDITOR_MIN_WIDTH = 150;
const TERMINAL_MIN_HEIGHT = 300;
const EDITOR_MIN_HEIGHT = 150;
const RESIZE_HANDLE_SIZE = 5;

type DragMode = "sidebar" | "terminal" | null;

const App: React.FC = () => {
  const [showTerminal, setTerminalStatus] = useState(false);
  const [terminalCount, setTerminalCount] = useState(0);
  const isFolderOpen = useSelector((state: any) => state.editor.isFolderOpen);
  const { theme, fontSize } = useSelector((state: any) => state.settings);
  const dispatch = useDispatch<AppDispatch>();
  const [isSettingsLoaded, setSettingsLoaded] = useState(false);

  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragModeRef = useRef<DragMode>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartSidebarWidthRef = useRef(300);
  const dragStartBottomHeightRef = useRef(300);

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  }, []);

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
      setShowBottomPanel(true);
    };

    const handleCloseTerminal = () => {
      setTerminalStatus(false);
      setShowBottomPanel(false);
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

  const handleToggleSidePannel = () => {
    setShowSidePanel(!showSidePanel);
  };

  const handleToggleBottomPanel = () => {
    setShowBottomPanel(!showBottomPanel);
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !dragModeRef.current) {
      return;
    }

    if (dragModeRef.current === "sidebar") {
      const deltaX = event.clientX - dragStartXRef.current;
      const nextWidth = dragStartSidebarWidthRef.current + deltaX;
      setSidebarWidth(clamp(nextWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH));
      return;
    }

    const deltaY = event.clientY - dragStartYRef.current;
    const containerHeight = containerRef.current.clientHeight;
    const maxBottomHeight = Math.max(TERMINAL_MIN_HEIGHT, containerHeight - EDITOR_MIN_HEIGHT);
    const nextBottomHeight = dragStartBottomHeightRef.current - deltaY;
    setBottomPanelHeight(clamp(nextBottomHeight, TERMINAL_MIN_HEIGHT, maxBottomHeight));
  }, [clamp]);

  const stopDragging = useCallback(() => {
    dragModeRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopDragging);
  }, [handleMouseMove]);

  const startSidebarDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragModeRef.current = "sidebar";
    dragStartXRef.current = event.clientX;
    dragStartSidebarWidthRef.current = sidebarWidth;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
  };

  const startTerminalDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragModeRef.current = "terminal";
    dragStartYRef.current = event.clientY;
    dragStartBottomHeightRef.current = bottomPanelHeight;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [handleMouseMove, stopDragging]);


  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <TitleBar toggleSidePannel={handleToggleSidePannel} toggleBottomPanel={handleToggleBottomPanel} />
      <div ref={containerRef} style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: showBottomPanel ? "0 0 auto" : 1,
            height: showBottomPanel ? `calc(100% - ${bottomPanelHeight}px)` : "100%",
            minHeight: EDITOR_MIN_HEIGHT,
            overflow: "hidden",
          }}
        >
          {isFolderOpen ? (
            <div style={{ height: "100%", width: "100%", display: "flex", overflow: "hidden" }}>
              {showSidePanel && (
                <>
                  <div style={{ width: sidebarWidth, minWidth: SIDEBAR_MIN_WIDTH, maxWidth: SIDEBAR_MAX_WIDTH, height: "100%", overflow: "hidden" }}>
                    <Sidebar />
                  </div>
                  <div
                    onMouseDown={startSidebarDrag}
                    style={{
                      width: RESIZE_HANDLE_SIZE,
                      cursor: "col-resize",
                      backgroundColor: "#1677ff",
                      flex: "0 0 auto",
                    }}
                  />
                </>
              )}
              <div style={{ flex: 1, minWidth: EDITOR_MIN_WIDTH, overflow: "hidden" }}>
                <Box sx={{ height: "100%", width: "100%", overflow: "hidden" }}>
                  <CodeEditor />
                </Box>
              </div>
            </div>
          ) : (
            <Box sx={{ height: "100%", width: "100%" }}>
              <WelcomeScreen />
            </Box>
          )}
        </div>
        {showBottomPanel && (
          <>
            <div
              onMouseDown={startTerminalDrag}
              style={{
                height: RESIZE_HANDLE_SIZE,
                cursor: "row-resize",
                backgroundColor: "#1677ff",
                flex: "0 0 auto",
              }}
            />
            <div style={{ height: bottomPanelHeight, minHeight: TERMINAL_MIN_HEIGHT, overflow: "hidden", flex: "0 0 auto" }}>
              {showTerminal && <TerminalContainer terminalCount={terminalCount} />}
            </div>
          </>
        )}
        <SettingsModal />
        <SearchModal />
      </div>
      <Footer />
    </div>
  );
};
export default App;
