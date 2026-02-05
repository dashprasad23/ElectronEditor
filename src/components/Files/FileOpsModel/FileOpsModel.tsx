import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import style from "./FileOpsModel.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

interface FileOpsTypes {
  modalVisible: boolean;
  setModalVisible: (data: boolean) => void;
  modalType: string;
  selectedNode: any;
  inputValue: string;
  setInputValue: (data: string) => void;
}

const FileOpsModel = ({ inputValue, setInputValue, modalVisible, setModalVisible, modalType, selectedNode }: FileOpsTypes) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const themeClass = isDark ? style.dark : style.light;

  const handleModalSubmit = () => {
    if (!inputValue) return;

    if (modalType === "createFile") {
      window.main.ipcRenderer.send("createFile", { parentPath: selectedNode.path, name: inputValue });
    } else if (modalType === "createFolder") {
      window.main.ipcRenderer.send("createFolder", { parentPath: selectedNode.path, name: inputValue });
    } else if (modalType === "rename") {
      const separator = selectedNode.path.includes("\\") ? "\\" : "/";
      const parentDir = selectedNode.path.substring(0, selectedNode.path.lastIndexOf(separator));
      const newPath = parentDir + separator + inputValue;
      window.main.ipcRenderer.send("renamePath", { oldPath: selectedNode.path, newPath: newPath });
    }

    setModalVisible(false);
    setInputValue("");
  };
  return <Modal
    open={modalVisible}
    onClose={() => setModalVisible(false)}
    aria-labelledby="modal-modal-title"
  >
    <Box className={`${style.actionModel} ${themeClass}`}>
      <Typography id="modal-modal-title" variant="h6" component="h5" gutterBottom>
        {modalType === 'createFile' ? "New File" : modalType === 'createFolder' ? "New Folder" : "Rename"}
      </Typography>
      <TextField
        autoFocus
        fullWidth
        variant="outlined"
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
        sx={{ mb: 3 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={() => setModalVisible(false)} variant="text" size="small" sx={{ color: isDark ? '#90caf9' : 'primary.main' }}>Cancel</Button>
        <Button onClick={handleModalSubmit} variant="contained" size="small">Confirm</Button>
      </Box>
    </Box>
  </Modal>
}



export default FileOpsModel;