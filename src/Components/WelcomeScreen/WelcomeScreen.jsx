import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FolderOpen, Terminal } from '@mui/icons-material';
import styles from './WelcomeScreen.module.scss';

const WelcomeScreen = () => {
  const handleOpenFolder = () => {
    window.main.ipcRenderer.send('open-folder-dialog');
  };

  const handleNewTerminal = () => {
    window.main.ipcRenderer.send('trigger-new-terminal');
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
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
