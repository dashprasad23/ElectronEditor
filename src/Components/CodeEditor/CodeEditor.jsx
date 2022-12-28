import {useEffect, useState} from "react";
import Editor from "../../UI/Editor";

export const CodeEditor = (props) => {
    const [code, setCode] = useState(null)
    useEffect(() => {
        const readFileHandler = async () => {

          const fileData = await window.main.fsPromis.readFile(props.path,{encoding: 'utf-8'})
          console.log(fileData);
        }

        if(props.fileData) {
            readFileHandler();
        }

    },[props])

    return (code ?<Editor fileData={code}/> :<></>)
}

export default CodeEditor;
