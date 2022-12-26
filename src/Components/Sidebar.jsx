import {
  FileOutlined
  } from '@ant-design/icons';
import { Layout, Tabs, theme} from 'antd';
import './Sidebar.scss';
import classes from './Sidebar.module.scss';
import FolderList from './Files/FolderList';
const { Sider } = Layout;


const Sidebar = (props) => {


  return (
    <Sider trigger={null} className={classes.Sidebar} collapsible collapsed={props.collapsed}>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="small"
        tabBarStyle={{background:'#001529'}}
        items={new Array(1).fill(null).map((_, i) => {
          const id = String(i + 1);
          return {
            label: (
              <span className={classes.TabHeader}>
                <FileOutlined />
                Files
              </span>
            ),
            key: id,
            children: (<FolderList/>),
          };
        })}
      />
    </Sider>
  );
};

export default Sidebar;
