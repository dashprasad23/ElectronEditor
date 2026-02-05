import React, { useState } from 'react';
import style from "./FolderNav.module.scss";
import { CreateNewFolder, NoteAdd } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import FileOpsModel from '../FileOpsModel/FileOpsModel';
import { RootState } from "../../../store";

const FolderNav = ({ selectedNode }: { selectedNode: any }) => {
    const rootDirectoryName = useSelector((state: any) => state.editor.rootDirectoryName);
    const { theme } = useSelector((state: RootState) => state.settings);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(""); // 'createFile', 'createFolder'
    const [inputValue, setInputValue] = useState("");

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const themeClass = isDark ? style.dark : style.light;

    return (
        <>
            <div className={`${style.navBar} ${themeClass}`}>
                <p>{rootDirectoryName || "File Explorer"}</p>
                <div className={style.actionIcons}>
                    <IconButton size="small" aria-label="new file"
                        disabled={selectedNode && selectedNode?.isLeaf}

                        onClick={() => {
                            setModalType("createFile");
                            setModalVisible(true);
                        }}>
                        <NoteAdd fontSize="small" />
                    </IconButton>
                    <IconButton size="small" aria-label="new folder" onClick={() => {
                        setModalType("createFolder");
                        setModalVisible(true);
                    }}>
                        <CreateNewFolder fontSize="small" />
                    </IconButton>
                </div>
            </div>
            <FileOpsModel
                modalVisible={modalVisible}
                setModalVisible={(data) => { setModalVisible(data) }}
                modalType={modalType}
                selectedNode={selectedNode}
                inputValue={inputValue}
                setInputValue={setInputValue} />
        </>
    );
};

export default FolderNav;