import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
const Editor = (props) => {



    return (<CodeMirror
        value={props.fileData}
        height="96vh"
        extensions={[javascript({ jsx: true })]}
        onChange={props.codeChange}
    />)

}

export default  Editor;
