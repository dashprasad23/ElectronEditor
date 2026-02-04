import React from 'react';
import style from "./FolderNav.module.scss";
import { CreateNewFolder, NoteAdd } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useSelector } from "react-redux";

const FolderNav: React.FC = () => {
    const rootDirectoryName = useSelector((state: any) => state.editor.rootDirectoryName);

    return (
        <div className={style.navBar}>
            <p>{rootDirectoryName || "File Explorer"}</p>
            <div className={style.actionIcons}>
                <IconButton size="small" aria-label="new file">
                    <NoteAdd fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label="new folder">
                    <CreateNewFolder fontSize="small" />
                </IconButton>
            </div>
        </div>
    );
};

export default FolderNav;