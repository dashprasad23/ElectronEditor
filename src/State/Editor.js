import { createSlice } from '@reduxjs/toolkit';

const initialEditorState = {
    activeTabIndex: -1,
    activeKey: null,
    filesTabList: [],
    isFolderOpen: false,
    treeData: []
};

const editorSlice = createSlice({
    name: 'editorData',
    initialState: initialEditorState,
    reducers: {
        addCodeFile(state, action) {
            const fileData = action.payload.fileData;
            const fileIndex = state.filesTabList.findIndex((file) => file.key === fileData.key);
            if (fileIndex > -1) {
                state.filesTabList[fileIndex] = fileData;
                state.activeTabIndex = fileIndex;
                state.activeKey = fileData.key;
            } else {
                state.filesTabList.push(fileData);
                state.activeTabIndex = state.filesTabList.length - 1;;
                state.activeKey = fileData.key;
            }

        },
        deleteCodeFile(state, action) {
            if (state.activeKey === action.payload) {
                const activeIndex = state.filesTabList.findIndex(file => file.key === action.payload);
                if (activeIndex === 0) {
                    if (activeIndex === state.filesTabList.length - 1) {
                        state.activeTabIndex = -1;
                        state.activeKey = null;
                    } else {
                        state.activeTabIndex = activeIndex + 1;
                        state.activeKey = state.filesTabList[activeIndex + 1].key
                    }
                } else {
                    state.activeTabIndex = activeIndex - 1;
                    state.activeKey = state.filesTabList[activeIndex - 1].key
                }
            }
            state.filesTabList = state.filesTabList.filter((file) => file.key !== action.payload)



        },
        editFile(state, action) {
            const code = action.payload.code;
            state.filesTabList[state.activeTabIndex].fileText = code;
        },
        setActiveKey(state, action) {
            state.activeKey = action.payload;
        },
        setFolderOpen(state, action) {
            state.isFolderOpen = action.payload;
        },
        setTreeData(state, action) {
            state.treeData = action.payload;
        },
        updateTreeChildren(state, action) {
            const { parentId, children } = action.payload;
            const updateChildren = (parentId, children, filesData) => {
                return filesData.map(node => {
                    const isSame = node.path === parentId;
                    const isParent = parentId.startsWith(node.path + (node.path.endsWith('/') || node.path.endsWith('\\') ? '' : '/')) ||
                        parentId.startsWith(node.path + '\\');

                    if (isSame) {
                        return { ...node, children: children };
                    } else if (node.children && isParent) {
                        return { ...node, children: updateChildren(parentId, children, node.children) };
                    }
                    return node;
                });
            };
            state.treeData = updateChildren(parentId, children, state.treeData);
        },
        clear(state) {
            return initialEditorState;
        }
    }
});

export const editorAction = editorSlice.actions;

export const readFileData = (file) => {
    return async (dispatch) => {
        const fileText = await window.main.fsPromis.readFile(file.path, { encoding: 'utf-8' });
        dispatch(editorAction.addCodeFile({ fileData: { ...file, fileText } }))
    }
}

export const saveCurrentFile = () => {
    return async (dispatch, getState) => {
        const state = getState().editor;
        if (state.activeTabIndex > -1) {
            const activeFile = state.filesTabList[state.activeTabIndex];
            try {
                await window.main.fsPromis.writeFile(activeFile.path, activeFile.fileText);
                console.log("File saved successfully:", activeFile.path);
            } catch (err) {
                console.error("Failed to save file:", err);
            }
        }
    }
}

export default editorSlice.reducer;