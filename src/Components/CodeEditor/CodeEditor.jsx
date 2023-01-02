import {Fragment, useCallback, useEffect} from "react";
import Editor from "../../UI/Editor";
import {useDispatch, useSelector} from "react-redux";
import {Tabs} from "antd";
import {editorAction} from "../../State/Editor";
export const CodeEditor = (props) => {
    const  dispatch = useDispatch();
    const editorData = useSelector((state) => state.editor);

    const listenFileSaveEvent = useCallback(() => {
        window.main.ipcRenderer.on('SAVE',() => {
            if(editorData.filesTabList.length >0) {
               const selectedFile = editorData.filesTabList[editorData.activeTabIndex];
               console.log(selectedFile);
               window.main.fs.writeFile(selectedFile.path, selectedFile.fileText, (err) => {
                   console.log(err);
               });

            }
        });
    },[editorData]);

   
    
    useEffect(() => {
      listenFileSaveEvent();
    }, [listenFileSaveEvent]);

    



    const onChange = (key) => {
        dispatch(editorAction.setActiveKey(key));
    };

    const onEdit = (key, action) => {
        dispatch(editorAction.deleteCodeFile(key))
    }
    const onEditorChange = useCallback((value, viewUpdate) => {
        dispatch(editorAction.editFile({code: value}));
    }, [dispatch]);

    return <Fragment>
        {editorData && <Tabs
        hideAdd
        style={{margin:0}}
        onChange={onChange}
        activeKey={editorData.activeKey}
        type="editable-card"
        onEdit={onEdit}
        items={editorData.filesTabList.map((tab, i) => {
            const id = String(i + 1);
            return {
                label: (tab.title),
                key: tab.key,
                children: <Editor fileData={tab.fileText} codeChange={onEditorChange}/>,
            };
        })}
    />}
    </Fragment>
}

export default CodeEditor;
