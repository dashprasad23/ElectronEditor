import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Box,
    useTheme as useMuiTheme,
    InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { searchAction } from '../../store/searchSlice';

import { readFileData } from '../../store/editorSlice';

const SearchModal: React.FC = () => {
    const dispatch = useDispatch<any>(); // Type as any to work with thunks easily
    const { isSearchOpen } = useSelector((state: RootState) => state.search);
    const { theme } = useSelector((state: RootState) => state.settings);
    const muiTheme = useMuiTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [allFiles, setAllFiles] = useState<{ path: string, name: string }[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<{ path: string, name: string }[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClose = () => {
        dispatch(searchAction.setSearchOpen(false));
        setSearchTerm('');
    };

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Fetch files when modal opens
    useEffect(() => {
        if (isSearchOpen) {
            setSearchTerm('');
            setSelectedIndex(0);
            setFilteredFiles([]); // Don't show files initially
            const fetchFiles = async () => {
                const { ipcRenderer } = window.main;
                try {
                    const workspacePath = await ipcRenderer.invoke('workspace:get-current');
                    if (workspacePath) {
                        const files = await ipcRenderer.invoke('search:get-all-files', workspacePath);
                        setAllFiles(files);
                        // Removed setFilteredFiles here to keep it empty initially
                    }
                } catch (error) {
                    console.error("Failed to fetch files for search:", error);
                }
            };
            fetchFiles();
        }
    }, [isSearchOpen]);

    // Fuzzy Search Algorithm
    useEffect(() => {
        if (!searchTerm) {
            setFilteredFiles([]); // Clear results if no search term
            return;
        }

        const query = searchTerm.toLowerCase();

        const scored = allFiles.map(file => {
            const name = file.name.toLowerCase();
            const path = file.path.toLowerCase();
            let score = 0;
            let matchIndex = 0;

            // 1. exact match bonus
            if (name === query) score += 100;

            // 2. Subsequence matching on name
            let queryIdx = 0;
            let currentNameIdx = 0;
            let consecutive = 0;

            while (queryIdx < query.length && currentNameIdx < name.length) {
                if (name[currentNameIdx] === query[queryIdx]) {
                    score += 10;
                    score += consecutive * 5; // Bonus for consecutive matches
                    consecutive++;

                    // Bonus for start of word (simplified: after separators or underscores or camelCase)
                    if (currentNameIdx === 0 || /[\W_]/.test(name[currentNameIdx - 1]) || (/[A-Z]/.test(file.name[currentNameIdx]))) {
                        score += 15;
                    }

                    queryIdx++;
                } else {
                    consecutive = 0;
                }
                currentNameIdx++;
            }

            // If we didn't match the full query in the name, try the full path but with less weight
            // Or just penalize if full query not found
            if (queryIdx < query.length) {
                return { file, score: -1 }; // Did not match
            }

            // Penalty for name length (preference for shorter, more exact matches)
            score -= (name.length - query.length);

            return { file, score };
        });

        const results = scored
            .filter(item => item.score > -1)
            .sort((a, b) => b.score - a.score)
            .slice(0, 50)
            .map(item => item.file);

        setFilteredFiles(results);
        setSelectedIndex(0);

    }, [searchTerm, allFiles]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredFiles[selectedIndex]) {
                openFile(filteredFiles[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    const openFile = async (file: { path: string, name: string }) => {
        try {
            // Use the existing thunk to read and open the file
            await dispatch(readFileData({
                title: file.name,
                key: file.path,
                path: file.path
            }));
            handleClose();
        } catch (e) {
            console.error("Failed to open file:", e);
        }
    };

    return (
        <Dialog
            open={isSearchOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    top: '10%',
                    position: 'absolute',
                    bgcolor: isDark ? '#1e1e1e' : 'background.paper',
                    color: isDark ? '#fff' : 'text.primary',
                    border: isDark ? '1px solid #333' : 'none',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <DialogContent sx={{ p: 1, flex: 'none' }}>
                <TextField
                    autoFocus
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: isDark ? '#aaa' : 'rgba(0,0,0,0.54)' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 2,
                            color: isDark ? '#fff' : 'inherit',
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                            }
                        }
                    }}
                />
            </DialogContent>
            {/* Results List */}
            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '400px', px: 1, pb: 1 }}>
                {filteredFiles.map((file, index) => (
                    <Box
                        key={file.path}
                        onClick={() => openFile(file)}
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: index === selectedIndex ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                            }
                        }}
                    >
                        {/* We could add generic file icon here */}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isDark ? '#888' : '#777', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.path}
                            </div>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Dialog>
    );
};

export default SearchModal;
