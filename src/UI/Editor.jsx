import CodeMirror from '@uiw/react-codemirror';
import { useCallback, useEffect, useState } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { css } from '@codemirror/legacy-modes/mode/css';
// import { html } from '@codemirror/legacy-modes/mode/html';
const Editor = (props) => {
    const [modes, setMode] = useState([]);

    const setEditorMode = useCallback((fileExt) => {
        console.log(fileExt)
        switch (fileExt) {
            case 'rb':
                setMode([StreamLanguage.define(ruby)])
                break;
            case 'go':
                setMode([StreamLanguage.define(go)])
                break;
            case 'js':
                setMode([javascript({ jsx: true })])
                break;
            case 'jsx':
                setMode([javascript({ jsx: true })])
                break;
            case 'ts':
                setMode([javascript({ typescript: true })])
                break;
            case 'tsx':
                setMode([javascript({ typescript: true, jsx: true })])
                break;
            case 'css':
                setMode([StreamLanguage.define(css)])
                break;
            case 'html':
                setMode([html()])
                break;

            default:

        }
    }, [])

    useEffect(() => {
        const re = /(?:\.([^.]+))?$/;
        let ext = re.exec(props.fileName)[1];
        setEditorMode(ext)

    }, [props.fileName, setEditorMode])



    return (<CodeMirror
        value={props.fileData}
        height="96vh"
        extensions={modes}
        onChange={props.codeChange}
    />)

}

export default Editor;
