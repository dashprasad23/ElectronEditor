import {createSlice} from '@reduxjs/toolkit';

const initialEditorState = {
    activeTabIndex: -1,
    activeKey:null,
    filesTabList: []
};

const editorSlice = createSlice({
    name:'editorData',
    initialState: initialEditorState,
    reducers: {
        addCodeFile(state, action) {
            const fileData = action.payload.fileData;
            const fileIndex = state.filesTabList.findIndex((file) => file.key === fileData.key);
            if(fileIndex >-1) {
                state.filesTabList[fileIndex] = fileData;
                state.activeTabIndex = fileIndex;
                state.activeKey = fileData.key;
            } else {
                state.filesTabList.push(fileData);
                state.activeTabIndex = state.filesTabList.length -1;;
                state.activeKey = fileData.key;
            }

        },
        deleteCodeFile(state, action)
        {
            if(state.activeKey === action.payload) {
                const activeIndex = state.filesTabList.findIndex(file => file.key === action.payload);
                if(activeIndex === 0) {
                    if(activeIndex === state.filesTabList.length -1) {
                        state.activeTabIndex = -1;
                        state.activeKey = null;
                    } else {
                        state.activeTabIndex = activeIndex +1;
                        state.activeKey = state.filesTabList[activeIndex +1].key
                    }
                }  else {
                    state.activeTabIndex = activeIndex -1;
                    state.activeKey = state.filesTabList[activeIndex -1].key
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
        }
    }
});

export const editorAction = editorSlice.actions;

export const readFileData = (file) => {
    return async (dispatch) => {
        const fileText = await  window.main.fsPromis.readFile(file.path,{encoding:'utf-8'});
        dispatch(editorAction.addCodeFile({fileData:{...file,fileText}}))
    }
}



export default editorSlice.reducer;