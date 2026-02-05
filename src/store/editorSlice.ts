import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface FileNode {
    title: string;
    key: string;
    path: string;
    isLeaf?: boolean;
    children?: FileNode[];
    isDirectory?: boolean;
}

interface FileTab {
    title: string;
    key: string;
    path: string;
    fileText: string;
}

interface EditorState {
    treeData: FileNode[];
    filesTabList: FileTab[];
    activeKey: string | null;
    isFolderOpen: boolean;
    loading: boolean;
    error: string | null;
    rootDirectoryName: string;
    currentBranch: string | null;
}

const initialState: EditorState = {
    treeData: [],
    filesTabList: [],
    activeKey: null,
    isFolderOpen: false,
    loading: false,
    error: null,
    rootDirectoryName: "",
    currentBranch: null
};

export const readFileData = createAsyncThunk(
    "editor/readFileData",
    async (data: { title: string, key: string, path: string }, thunkAPI) => {
        try {
            const response = await window.main.ipcRenderer.invoke("read-file", data.path);
            return { ...data, fileText: response };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const saveCurrentFile = createAsyncThunk(
    "editor/saveCurrentFile",
    async (_, thunkAPI) => {
        const state = (thunkAPI.getState() as any).editor as EditorState;
        const activeFile = state.filesTabList.find(f => f.key === state.activeKey);
        if (activeFile) {
            try {
                await window.main.ipcRenderer.invoke("save-file", {
                    path: activeFile.path,
                    content: activeFile.fileText
                });
                return { success: true };
            } catch (error: any) {
                return thunkAPI.rejectWithValue(error.message);
            }
        }
    }
);

const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        setTreeData: (state, action: PayloadAction<FileNode[]>) => {
            state.treeData = action.payload;
        },
        setRootDirectoryName: (state, action: PayloadAction<string>) => {
            state.rootDirectoryName = action.payload;
        },
        setGitBranch: (state, action: PayloadAction<string | null>) => {
            state.currentBranch = action.payload;
        },
        updateTreeChildren: (state, action: PayloadAction<{ parentId: string, children: FileNode[] }>) => {
            const { parentId, children } = action.payload;
            const updateChildren = (items: FileNode[]): boolean => {
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
        setActiveKey: (state, action: PayloadAction<string>) => {
            state.activeKey = action.payload;
        },
        setFolderOpen: (state, action: PayloadAction<boolean>) => {
            state.isFolderOpen = action.payload;
        },
        addCodeFile: (state, action: PayloadAction<FileTab>) => {
            const exists = state.filesTabList.find(f => f.key === action.payload.key);
            if (!exists) {
                state.filesTabList.push(action.payload);
            }
            state.activeKey = action.payload.key;
        },
        deleteCodeFile: (state, action: PayloadAction<string>) => {
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
        editFile: (state, action: PayloadAction<{ code: string }>) => {
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
            state.rootDirectoryName = "";
            state.currentBranch = null;
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