import FolderList from "../components/Files/FolderList";
import { FolderCopy, GitHub } from "@mui/icons-material";

export const TabList = [
  {
    name: "Files",
    icon: <FolderCopy fontSize="small" />,
    children: <FolderList />,
  },
  {
    name: "Git",
    icon: <GitHub fontSize="small" />,
    children: <></>,
  },
];
