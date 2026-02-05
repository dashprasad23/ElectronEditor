import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Paper,
    useTheme as useMuiTheme,
    alpha
} from '@mui/material';
import { LightMode, DarkMode, Computer } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { settingsAction } from '../../store/settingsSlice';

const SettingsModal: React.FC = () => {
    const dispatch = useDispatch();
    const { theme, fontSize, isSettingsOpen } = useSelector((state: RootState) => state.settings);
    const muiTheme = useMuiTheme();

    const handleClose = () => {
        dispatch(settingsAction.setSettingsOpen(false));
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        dispatch(settingsAction.setTheme(newTheme));
    };

    const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(settingsAction.setFontSize(Number(event.target.value)));
    };

    const ThemeOption = ({ value, label, icon: Icon }: { value: 'light' | 'dark' | 'system', label: string, icon: any }) => {
        const isSelected = theme === value;
        return (
            <Paper
                elevation={0}
                onClick={() => handleThemeChange(value)}
                sx={{
                    flex: 1,
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: isSelected ? alpha(muiTheme.palette.primary.main, 0.08) : 'transparent',
                    border: `2px solid ${isSelected ? muiTheme.palette.primary.main : muiTheme.palette.divider}`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: isSelected ? alpha(muiTheme.palette.primary.main, 0.12) : alpha(muiTheme.palette.text.primary, 0.04),
                    }
                }}
            >
                <Icon sx={{
                    fontSize: 28,
                    color: isSelected
                        ? 'primary.main'
                        : (isDark ? '#fff' : 'text.secondary') // Use white in dark mode if not selected
                }} />
                <Typography
                    variant="body2"
                    fontWeight={isSelected ? 600 : 400}
                    color={isSelected
                        ? 'primary.main'
                        : (isDark ? '#fff' : 'text.primary') // Use white in dark mode if not selected
                    }
                >
                    {label}
                </Typography>
            </Paper>
        );
    };

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <Dialog
            open={isSettingsOpen}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    bgcolor: isDark ? '#1e1e1e' : 'background.paper',
                    color: isDark ? '#fff' : 'text.primary',
                    border: isDark ? '1px solid #333' : 'none'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
                Settings
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 1 }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, color: isDark ? '#aaa' : 'text.secondary' }}>
                            Appearance
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <ThemeOption value="light" label="Light" icon={LightMode} />
                            <ThemeOption value="dark" label="Dark" icon={DarkMode} />
                            <ThemeOption value="system" label="System" icon={Computer} />
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, color: isDark ? '#aaa' : 'text.secondary' }}>
                            Editor
                        </Typography>
                        <TextField
                            label="Font Size"
                            type="number"
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                                sx: {
                                    borderRadius: 2,
                                    color: isDark ? '#fff' : 'inherit',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDark ? '#444' : 'rgba(0, 0, 0, 0.23)'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDark ? '#666' : 'rgba(0, 0, 0, 0.87)'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDark ? '#90caf9' : 'primary.main'
                                    }
                                }
                            }}
                            InputLabelProps={{
                                sx: {
                                    color: isDark ? '#aaa' : 'rgba(0, 0, 0, 0.6)',
                                    '&.Mui-focused': {
                                        color: isDark ? '#90caf9' : 'primary.main'
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    disableElevation
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingsModal;
