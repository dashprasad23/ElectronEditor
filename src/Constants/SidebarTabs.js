import FolderList from "../Components/Files/FolderList";
import { FileOutlined, GithubOutlined } from "@ant-design/icons";

export const TabList = [
  {
    name: "files",
    icon: <FileOutlined />,
    children: <FolderList />,
  },
  {
    name: "Git",
    icon: <GithubOutlined />,
    children: <></>,
  },
];
