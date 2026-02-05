import React, { SyntheticEvent } from "react";
import Editor from "../CodeMirrorEditor/CodeMirrorEditor";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Tab, Box, IconButton, Typography } from "@mui/material";
import { Close, Description } from "@mui/icons-material";
import { editorAction } from "../../store/editorSlice";
import FileIcon from "../FileIcon/FileIcon";

import style from "./CodeEditor.module.scss";
import { RootState } from "../../store";

const EmptyEditorState = () => {
  const isMac = window.main.os.platform === 'darwin';
  const modifier = isMac ? '⌘' : 'Ctrl';
  const { theme } = useSelector((state: RootState) => state.settings);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const themeClass = isDark ? style.dark : style.light;

  return (
    <div className={`${style.emptyState} ${themeClass}`}>
      <Description className={style.icon} sx={{ fontSize: 64 }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          No File Open
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Select a file from the sidebar to start editing
        </Typography>

        <div className={style.tipsBox}>
          <Typography className={style.tipTitle} variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            Quick Tips:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography className={style.tipItem} variant="caption" sx={{ fontSize: '0.75rem' }}>
              • Click any file in the sidebar to open it
            </Typography>
            <Typography className={style.tipItem} variant="caption" sx={{ fontSize: '0.75rem' }}>
              • Use {modifier}+S to save your changes
            </Typography>
            <Typography className={style.tipItem} variant="caption" sx={{ fontSize: '0.75rem' }}>
              • Use {modifier}+Shift+W to close workspace
            </Typography>
          </Box>
        </div>
      </Box>
    </div>
  );
};

export const CodeEditor: React.FC = (props) => {
  const dispatch = useDispatch();
  const editorData = useSelector((state: any) => state.editor);
  const { theme } = useSelector((state: RootState) => state.settings);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const themeClass = isDark ? style.dark : style.light;

  const onChange = (event: SyntheticEvent, newValue: string) => {
    dispatch(editorAction.setActiveKey(newValue));
  };

  const handleCloseTab = (event: React.MouseEvent, key: string) => {
    event.stopPropagation();
    dispatch(editorAction.deleteCodeFile(key));
  };

  const onEditorChange = (value: string) => {
    dispatch(editorAction.editFile({ code: value }));
  };

  return (
    <div className={`${style.codeEditor} ${themeClass}`}>
      {editorData.filesTabList.length > 0 ? (
        <>
          <div className={`${style.tabContainer} ${themeClass}`}>
            <Tabs
              value={editorData.activeKey}
              onChange={onChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
              indicatorColor={isDark ? "secondary" : "primary"}
              sx={{
                minHeight: 32,
                '& .MuiTabs-indicator': {
                  backgroundColor: isDark ? '#1677ff' : '#1976d2'
                }
              }}
            >
              {editorData.filesTabList.map((tab: any) => (
                <Tab
                  key={tab.key}
                  value={tab.key}
                  className={`${style.tab} ${themeClass}`}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FileIcon fileName={tab.title} size={14} />
                      {tab.title}
                      <IconButton
                        size="small"
                        onClick={(e) => handleCloseTab(e, tab.key)}
                        sx={{ p: 0.1, ml: 0.5, color: 'inherit' }}
                        className="close-icon"
                      >
                        <Close sx={{ fontSize: 11 }} />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </div>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {editorData.filesTabList.map((tab: any, index: number) => (
              <Box
                key={tab.key}
                role="tabpanel"
                hidden={editorData.activeKey !== tab.key}
                sx={{ height: '100%' }}
              >
                {editorData.activeKey === tab.key && (
                  <Editor
                    fileData={tab.fileText}
                    fileName={tab.title}
                    codeChange={(value: any) => onEditorChange(value)}
                  />
                )}
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <EmptyEditorState />
      )}
    </div>
  );
}

export default CodeEditor;
