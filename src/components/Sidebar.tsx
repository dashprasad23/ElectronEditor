import React, { useState, SyntheticEvent } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { TabList } from '../constants/SidebarTabs'
import style from "./Sidebar.module.scss"

const Sidebar: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className={style.sidebar} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider', bgcolor: '#fff' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="sidebar tabs"
          variant="fullWidth"
          sx={{ minHeight: 32 }}
        >
          {TabList.map((tab: any, i: number) => (
            <Tab
              key={i}
              icon={tab.icon}
              label={tab.name}
              sx={{
                minWidth: 0,
                fontSize: '0.65rem',
                padding: '4px 0',
                minHeight: 32,
                '& .MuiSvgIcon-root': { fontSize: 16 }
              }}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        {TabList[value]?.children}
      </Box>
    </Box>
  );
};

export default Sidebar;
