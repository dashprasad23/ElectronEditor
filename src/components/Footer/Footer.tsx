import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import styles from './Footer.module.scss';

// Icons
import ForkLeftIcon from '@mui/icons-material/ForkLeft'; // Git branch

const Footer: React.FC = () => {
  const { activeKey, currentBranch } = useSelector((state: any) => state.editor);

  // Determine current language from active file extension
  const getLanguage = () => {
    if (!activeKey) return 'Plain Text';
    const ext = activeKey.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'JavaScript';
      case 'jsx': return 'JavaScript React';
      case 'ts': return 'TypeScript';
      case 'tsx': return 'TypeScript React';
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'scss': return 'SCSS';
      case 'json': return 'JSON';
      case 'md': return 'Markdown';
      case 'py': return 'Python';
      case 'java': return 'Java';
      case 'cpp': return 'C++';
      case 'c': return 'C';
      case 'go': return 'Go';
      case 'php': return 'PHP';
      case 'rs': return 'Rust';
      case 'sql': return 'SQL';
      case 'xml': return 'XML';
      case 'yaml': case 'yml': return 'YAML';
      default: return 'Plain Text';
    }
  };

  return (
    <Box className={styles.Footer}>
      {/* Left Section */}
      <div className={styles.leftSection}>

        {currentBranch && (
          <div className={styles.item} title="Git Branch">
            <ForkLeftIcon style={{ fontSize: 16, transform: 'rotate(90deg)' }} />
            <span>{currentBranch}</span>
          </div>
        )}

        {/* <div className={styles.item} title="No Errors">
          <CancelIcon style={{ fontSize: 12 }} />
          <span>0</span>
          <WarningIcon style={{ fontSize: 12, marginLeft: '4px' }} />
          <span>0</span>
        </div> */}
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        <div className={styles.item} title="Cursor Position">
          <span>Ln 1, Col 1</span>
        </div>

        <div className={styles.item} title="Indentation">
          <span>Spaces: 2</span>
        </div>

        <div className={styles.item} title="Encoding">
          <span>UTF-8</span>
        </div>

        <div className={styles.item} title="End of Line Sequence">
          <span>LF</span>
        </div>

        <div className={styles.item} title="Language Mode">
          <span>{getLanguage()}</span>
        </div>
        {/* 
        <div className={styles.item} title="Prettier">
          <CheckIcon style={{ fontSize: 12 }} />
          <span>Prettier</span>
        </div>

        <div className={styles.item} title="Notifications">
          <NotificationsNoneIcon style={{ fontSize: 14 }} />
        </div> */}
      </div>
    </Box>
  );
}

export default Footer;