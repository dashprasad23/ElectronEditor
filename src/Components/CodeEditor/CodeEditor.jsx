import {Fragment, useCallback, useEffect} from "react";
import Editor from "../../UI/Editor";
import {useDispatch, useSelector} from "react-redux";
import {Tabs} from "antd";
import {editorAction} from "../../State/Editor";
import {FileOutlined} from "@ant-design/icons";

export const CodeEditor = (props) => {
    const  dispatch = useDispatch();
    const editorData = useSelector((state) => state.editor);
    
    /**
     *  set active code tab
     * @param {*} key 
     */
    const onChange = (key) => {
        dispatch(editorAction.setActiveKey(key));
    };

    /**
     *  remove selected file tab 
     * @param {*} key 
     * @param {*} action 
     */
    const onEdit = (key, action) => {
        dispatch(editorAction.deleteCodeFile(key))
    }

    
    /**
     *  write editor date in file
     * @param {*} fileData 
     */
    const saveFileData = (fileData) => {
        dispatch(editorAction.editFile({code: fileData}));
        if(editorData.filesTabList.length >0) {
            const selectedFile = editorData.filesTabList[editorData.activeTabIndex];
            window.main.fs.writeFile(selectedFile.path, fileData, (err) => {
            });

         }
    }
    
    /**
     *  debound the editor change event
     * @param {*} func 
     * @returns 
     */
    const debounce = (func) => {
        let timer;
        return function (...args) {
          const context = this;
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            timer = null;
            func.apply(context, args);
          }, 500);
        };
      };
  
    const onEditorChange = debounce(saveFileData);

    return <Fragment>
        {editorData && <Tabs
        hideAdd
        style={{margin:0}}
        onChange={onChange}
        activeKey={editorData.activeKey}
        type="editable-card"
        onEdit={onEdit}
        items={editorData.filesTabList.map((tab, i) => {
            return {
                label: <span>
                <FileOutlined/>
                {tab.title}
              </span>,
                key: tab.key,
                children: <Editor fileData={tab.fileText} fileName={tab.title} codeChange={(value) => onEditorChange(value)}/>,
            };
        })}
    />}
    </Fragment>
}

export default CodeEditor;
