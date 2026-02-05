import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    isSettingsOpen: boolean;
}

const initialState: SettingsState = {
    theme: 'system',
    fontSize: 14,
    isSettingsOpen: false,
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
            state.theme = action.payload;
        },
        setFontSize: (state, action: PayloadAction<number>) => {
            state.fontSize = action.payload;
        },
        setSettingsOpen: (state, action: PayloadAction<boolean>) => {
            state.isSettingsOpen = action.payload;
        },
        setSettings: (state, action: PayloadAction<{ theme: 'light' | 'dark' | 'system', fontSize: number }>) => {
            state.theme = action.payload.theme;
            state.fontSize = action.payload.fontSize;
        },
    },
});

export const settingsAction = settingsSlice.actions;
export default settingsSlice.reducer;
