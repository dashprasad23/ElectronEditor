import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Tooltip } from '@mui/material';
import { FolderOpen, Terminal, Folder, Close } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { editorAction } from '../../store/editorSlice';
import styles from './WelcomeScreen.module.scss';

const WelcomeScreen: React.FC = () => {
  const [recentWorkspaces, setRecentWorkspaces] = useState<string[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch recent workspaces on mount
    const fetchRecentWorkspaces = async () => {
      try {
        const workspaces = await window.main.ipcRenderer.invoke('workspace:get-recent');
        // Show all recent workspaces (scrolling handled by CSS)
        setRecentWorkspaces(workspaces);
      } catch (error) {
        console.error('Error fetching recent workspaces:', error);
      }
    };

    fetchRecentWorkspaces();

    // Listen for workspace-closed event
    const handleWorkspaceClosed = () => {
      dispatch(editorAction.clear());
      fetchRecentWorkspaces();
    };

    window.main.ipcRenderer.on('workspace-closed', handleWorkspaceClosed);

    return () => {
      window.main.ipcRenderer.removeListener('workspace-closed', handleWorkspaceClosed);
    };
  }, [dispatch]);

  const handleOpenFolder = () => {
    window.main.ipcRenderer.send('open-folder-dialog', null);
  };

  const handleNewTerminal = () => {
    window.main.ipcRenderer.send('trigger-new-terminal', null);
  };

  const handleOpenRecentWorkspace = (workspacePath: string) => {
    window.main.ipcRenderer.send('open-folder-dialog', workspacePath);
  };

  const handleRemoveRecentWorkspace = async (e: React.MouseEvent, workspacePath: string) => {
    e.stopPropagation(); // Prevent opening the workspace
    try {
      const updatedWorkspaces = await window.main.ipcRenderer.invoke('workspace:remove-recent', workspacePath);
      setRecentWorkspaces(updatedWorkspaces);
    } catch (error) {
      console.error('Error removing recent workspace:', error);
    }
  };

  const isMac = window.main.os.platform === 'darwin';
  const modifier = isMac ? '⌘' : 'Ctrl';

  return (
    <Box className={styles.welcomeContainer}>
      <Box className={styles.content}>
        <Typography variant="h3" className={styles.title}>
          Electron Editor
        </Typography>
        <Typography variant="subtitle1" className={styles.subtitle}>
          Modern, lightweight, and extensible.
        </Typography>

        <Box className={styles.actions}>
          <Button
            variant="contained"
            startIcon={<FolderOpen />}
            onClick={handleOpenFolder}
            className={styles.button}
          >
            Open Folder
          </Button>
          <Button
            variant="outlined"
            startIcon={<Terminal />}
            onClick={handleNewTerminal}
            className={styles.button}
          >
            New Terminal
          </Button>
        </Box>

        {recentWorkspaces.length > 0 && (
          <Box className={styles.recentSection}>
            <Typography variant="h6" className={styles.recentTitle}>
              Recent Workspaces
            </Typography>
            <List className={styles.recentList}>
              {recentWorkspaces.map((workspace, index) => (
                <ListItem key={index} disablePadding className={styles.recentItem}>
                  <ListItemButton
                    onClick={() => handleOpenRecentWorkspace(workspace)}
                    className={styles.recentButton}
                  >
                    <ListItemIcon className={styles.recentIcon}>
                      <Folder />
                    </ListItemIcon>
                    <ListItemText
                      primary={workspace.split('/').pop() || workspace}
                      secondary={workspace}
                      primaryTypographyProps={{ className: styles.workspaceName }}
                      secondaryTypographyProps={{ className: styles.workspacePath }}
                    />
                  </ListItemButton>
                  <Tooltip title="Remove from recent">
                    <IconButton
                      className={styles.deleteButton}
                      onClick={(e) => handleRemoveRecentWorkspace(e, workspace)}
                      size="small"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box className={styles.shortcuts}>
          <Box className={styles.shortcutItem}>
            <Typography variant="body2" className={styles.label}>Open Folder</Typography>
            <Typography variant="body2" className={styles.key}>{modifier} + O</Typography>
          </Box>
          <Box className={styles.shortcutItem}>
            <Typography variant="body2" className={styles.label}>New Terminal</Typography>
            <Typography variant="body2" className={styles.key}>{modifier} + `</Typography>
          </Box>
          <Box className={styles.shortcutItem}>
            <Typography variant="body2" className={styles.label}>Save File</Typography>
            <Typography variant="body2" className={styles.key}>{modifier} + S</Typography>
          </Box>
          <Box className={styles.shortcutItem}>
            <Typography variant="body2" className={styles.label}>Close Workspace</Typography>
            <Typography variant="body2" className={styles.key}>{modifier} + Shift + W</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
