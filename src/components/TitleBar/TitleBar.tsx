import React from 'react';
import styles from './TitleBar.module.scss';
import { useSelector } from 'react-redux';
import {
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { ReactComponent as BrowserIcon } from '../../assets/icon/browser.svg';
import { ReactComponent as SidebarLeftIcon } from '../../assets/icon/sidebar-left.svg';
import { ReactComponent as SidebarBottomIcon } from '../../assets/icon/sidebar-bottom.svg';

const TitleBar: React.FC = () => {
    // Use "any" for state type for now as we don't have the full State type definition available here
    const theme = useSelector((state: any) => state.settings?.theme);
    const activeFile = useSelector((state: any) => state.editor?.activeFile);
    const currentWorkspace = useSelector((state: any) => state.editor?.rootDirectoryName);

    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const handleRestart = () => {
        window.location.reload();
    };

    const title = activeFile
        ? `${currentWorkspace || 'ElectronEditor'} — ${activeFile.name} (Working Tree)`
        : 'ElectronEditor';

    const [platform, setPlatform] = React.useState<string>('');

    React.useEffect(() => {
        if (window.main?.os?.platform) {
            setPlatform(window.main.os.platform);
        }
    }, []);

    const isMac = platform === 'darwin';

    return (
        <div className={`${styles.titleBar} ${isDarkMode ? styles.dark : ''}`}>
            {isMac && (
                <div className={styles.leftSection}>
                    {/* Spacer for Traffic Lights */}
                </div>
            )}

            <div className={styles.centerSection}>
                {title}
            </div>

            <div className={styles.rightSection}>
                <Tooltip title="Browser">
                    <div className={`${styles.iconButton} ${isDarkMode ? styles.dark : ''}`}>
                        <BrowserIcon width={16} height={16} style={{ fill: isDarkMode ? '#cccccc' : '' }} />
                    </div>
                </Tooltip>

                <Tooltip title="Toggle Sidebar">
                    <div className={`${styles.iconButton} ${isDarkMode ? styles.dark : ''}`}>
                        <SidebarLeftIcon width={16} height={16} style={{ fill: isDarkMode ? '#cccccc' : '#333333' }} />
                    </div>
                </Tooltip>

                <Tooltip title="Toggle Panel">
                    <div className={`${styles.iconButton} ${isDarkMode ? styles.dark : ''}`}>
                        <SidebarBottomIcon width={16} height={16} style={{ fill: isDarkMode ? '#cccccc' : '#333333' }} />
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

export default TitleBar;
