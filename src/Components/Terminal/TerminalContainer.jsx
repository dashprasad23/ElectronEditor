import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import Terminal from './Terminal';

const TerminalContainer = () => {
  const [terminals, setTerminals] = useState([{ id: '1', key: '1' }]);
  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    const handleNewTerminal = () => {
      setTerminals(prev => {
        const newId = String(Date.now());
        const newTerms = [...prev, { id: newId, key: newId }];
        setActiveKey(newId);
        return newTerms;
      });
    };

    const handleCloseTerminal = () => {
      setTerminals([]);
    };

    window.main.ipcRenderer.on('newTerminal', handleNewTerminal);
    window.main.ipcRenderer.on('closeTerminal', handleCloseTerminal);

    return () => {
      window.main.ipcRenderer.removeListener('newTerminal', handleNewTerminal);
      window.main.ipcRenderer.removeListener('closeTerminal', handleCloseTerminal);
    };
  }, []);

  const handleChange = (event, newActiveKey) => {
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    terminals.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = terminals.filter((item) => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setTerminals(newPanes);
    setActiveKey(newActiveKey);
  };

  if (terminals.length === 0) {
    return (
      <Box sx={{ p: 3, color: 'text.secondary', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#ffffff' }}>
        <Typography>No open terminals. Go to Terminal {"->"} New Terminal to open one. </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeKey}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 32 }}
        >
          {terminals.map((item, i) => (
            <Tab
              key={item.key}
              value={item.key}
              sx={{
                minHeight: 32,
                py: 0.5,
                px: 2,
                color: 'rgba(0,0,0,0.6)',
                textTransform: 'none',
                '&.Mui-selected': { color: '#1677ff' }
              }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {`Terminal ${i + 1}`}
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); remove(item.key); }}
                    sx={{ p: 0.2, ml: 1, color: 'inherit' }}
                  >
                    <Close sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {terminals.map((item) => (
          <Box
            key={item.key}
            role="tabpanel"
            hidden={activeKey !== item.key}
            sx={{ height: '100%' }}
          >
            {activeKey === item.key && <Terminal id={item.id} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TerminalContainer;