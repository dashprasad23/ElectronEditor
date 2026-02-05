import React, { useState, SyntheticEvent } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { TabList } from '../constants/SidebarTabs'
import style from "./Sidebar.module.scss"
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Sidebar: React.FC = () => {
  const [value, setValue] = useState(0);
  const { theme } = useSelector((state: RootState) => state.settings);

  // Determine effective theme (handle system default if needed, for now mapping system to light or implementing logic)
  // Simple mapping: 'dark' -> dark, everything else -> light for now, or use media query hook for system.
  // Assuming 'system' defaults to 'light' if we don't have a hook, OR we can check matchMedia.
  // For simplicity implementation:
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const themeClass = isDark ? style.dark : style.light;

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={`${style.sidebar} ${themeClass}`}>
      <div className={style.header}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="sidebar tabs"
          variant="fullWidth"
          textColor={isDark ? "inherit" : "primary"}
          indicatorColor={isDark ? "secondary" : "primary"}
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
      </div>
      <div className={style.content}>
        {TabList[value]?.children}
      </div>
    </div>
  );
};

export default Sidebar;
