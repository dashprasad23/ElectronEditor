import { Layout, Tabs} from 'antd';
import {TabList} from '../Constants/SidebarTabs'
import classes from './Sidebar.module.scss';
const { Sider } = Layout;


const Sidebar = (props) => {


  return (
    <Sider trigger={null} className={classes.Sidebar} collapsible collapsed={props.collapsed}>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="small"
        items={TabList.map((tab, i) => {
          const id = String(i + 1);
          return {
            label: (
              <span className={classes.TabHeader}>
                {tab.icon}
                {tab.name}
              </span>
            ),
            key: id,
            children: (tab.children),
          };
        })}
      />
    </Sider>
  );
};

export default Sidebar;
