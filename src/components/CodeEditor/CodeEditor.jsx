import React from "react";
import Editor from "../CodeMirrorEditor/CodeMirrorEditor";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Tab, Box, IconButton, Typography } from "@mui/material";
import { Close, Description, FolderOpen } from "@mui/icons-material";
import { editorAction } from "../../store/editorSlice";
import FileIcon from "../FileIcon/FileIcon";

const EmptyEditorState = () => {
  const isMac = window.main.os.platform === 'darwin';
  const modifier = isMac ? '⌘' : 'Ctrl';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#999',
        gap: 3,
        px: 4
      }}
    >
      <Description sx={{ fontSize: 64, color: '#ddd' }} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#666', mb: 1, fontWeight: 600 }}>
          No File Open
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
          Select a file from the sidebar to start editing
        </Typography>

        <Box sx={{
          display: 'inline-block',
          textAlign: 'left',
          bgcolor: '#f8f8f8',
          borderRadius: 2,
          p: 2,
          border: '1px solid #e8e8e8'
        }}>
          <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1, fontWeight: 600 }}>
            Quick Tips:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
              • Click any file in the sidebar to open it
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
              • Use {modifier}+S to save your changes
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
              • Use {modifier}+Shift+W to close workspace
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const CodeEditor = (props) => {
  const dispatch = useDispatch();
  const editorData = useSelector((state) => state.editor);

  const onChange = (event, newValue) => {
    dispatch(editorAction.setActiveKey(newValue));
  };

  const handleCloseTab = (event, key) => {
    event.stopPropagation();
    dispatch(editorAction.deleteCodeFile(key));
  };

  const onEditorChange = (value) => {
    dispatch(editorAction.editFile({ code: value }));
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {editorData.filesTabList.length > 0 ? (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
            <Tabs
              value={editorData.activeKey}
              onChange={onChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 32 }}
            >
              {editorData.filesTabList.map((tab) => (
                <Tab
                  key={tab.key}
                  value={tab.key}
                  sx={{
                    minHeight: 32,
                    py: 0,
                    px: 2,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    borderRight: '1px solid #e0e0e0'
                  }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FileIcon fileName={tab.title} size={14} />
                      {tab.title}
                      <IconButton
                        size="small"
                        onClick={(e) => handleCloseTab(e, tab.key)}
                        sx={{ p: 0.1, ml: 0.5 }}
                      >
                        <Close sx={{ fontSize: 11 }} />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {editorData.filesTabList.map((tab, index) => (
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
                    codeChange={(value) => onEditorChange(value)}
                  />
                )}
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <EmptyEditorState />
      )}
    </Box>
  );
}

export default CodeEditor;
