import React from "react";
import Editor from "../../UI/Editor";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, Tab, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { editorAction } from "../../State/Editor";
import FileIcon from "../../UI/FileIcon";

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
      {editorData.filesTabList.length > 0 && (
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
      )}
    </Box>
  );
}

export default CodeEditor;
