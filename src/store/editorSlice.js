import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const readFileData = createAsyncThunk(
    "editor/readFileData",
    async (data, thunkAPI) => {
        try {
            const response = await window.main.ipcRenderer.invoke("read-file", data.path);
            return { ...data, fileText: response };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const saveCurrentFile = createAsyncThunk(
    "editor/saveCurrentFile",
    async (_, thunkAPI) => {
        const state = thunkAPI.getState().editor;
        const activeFile = state.filesTabList.find(f => f.key === state.activeKey);
        if (activeFile) {
            try {
                await window.main.ipcRenderer.invoke("save-file", {
                    path: activeFile.path,
                    content: activeFile.fileText
                });
                return { success: true };
            } catch (error) {
                return thunkAPI.rejectWithValue(error.message);
            }
        }
    }
);

const editorSlice = createSlice({
    name: "editor",
    initialState: {
        treeData: [],
        filesTabList: [],
        activeKey: null,
        isFolderOpen: false,
        loading: false,
        error: null
    },
    reducers: {
        setTreeData: (state, action) => {
            state.treeData = action.payload;
        },
        updateTreeChildren: (state, action) => {
            const { parentId, children } = action.payload;
            const updateChildren = (items) => {
                for (let item of items) {
                    if (item.path === parentId) {
                        item.children = children;
                        return true;
                    }
                    if (item.children && updateChildren(item.children)) {
                        return true;
                    }
                }
                return false;
            };
            updateChildren(state.treeData);
        },
        setActiveKey: (state, action) => {
            state.activeKey = action.payload;
        },
        setFolderOpen: (state, action) => {
            state.isFolderOpen = action.payload;
        },
        addCodeFile: (state, action) => {
            const exists = state.filesTabList.find(f => f.key === action.payload.key);
            if (!exists) {
                state.filesTabList.push(action.payload);
            }
            state.activeKey = action.payload.key;
        },
        deleteCodeFile: (state, action) => {
            const index = state.filesTabList.findIndex(f => f.key === action.payload);
            state.filesTabList = state.filesTabList.filter(f => f.key !== action.payload);
            if (state.activeKey === action.payload) {
                if (state.filesTabList.length > 0) {
                    state.activeKey = state.filesTabList[Math.max(0, index - 1)].key;
                } else {
                    state.activeKey = null;
                }
            }
        },
        editFile: (state, action) => {
            const file = state.filesTabList.find(f => f.key === state.activeKey);
            if (file) {
                file.fileText = action.payload.code;
            }
        },
        clear: (state) => {
            state.treeData = [];
            state.filesTabList = [];
            state.activeKey = null;
            state.isFolderOpen = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(readFileData.fulfilled, (state, action) => {
                const exists = state.filesTabList.find(f => f.key === action.payload.key);
                if (!exists) {
                    state.filesTabList.push(action.payload);
                }
                state.activeKey = action.payload.key;
            });
    }
});

export const editorAction = editorSlice.actions;
export default editorSlice.reducer;