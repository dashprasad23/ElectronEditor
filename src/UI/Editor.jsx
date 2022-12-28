import CodeMirror from '@uiw/react-codemirror';
import {useCallback} from 'react';
import { javascript } from '@codemirror/lang-javascript';
const Editor = (props) => {

    const onChange = useCallback((value, viewUpdate) => {
        console.log('value:', value);
    }, []);

    return (<CodeMirror
        value={props.fileData}
        height="200px"
        extensions={[javascript({ jsx: true })]}
        onChange={onChange}
    />)

}

export default  Editor;
