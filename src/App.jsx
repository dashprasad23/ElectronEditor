import React, { useEffect, useState } from "react";
import classes from "./App.scss";
import Sidebar from "./Components/Sidebar";
import { Layout} from "antd";
import { ResizeHorizon, Resize } from "react-resize-layout";
const { Content } = Layout;
const App = () => {
  const [collapsed, setCollapsed] = useState(false);


  return (
    <Resize handleWidth="5px" handleColor="#777">
      <ResizeHorizon width="200px">
       <Sidebar collapsed={collapsed}/>
      </ResizeHorizon>
      <ResizeHorizon width="200px" minWidth="150px">
        <Layout className={classes.MainLayout}>
          <Content>
            Content
          </Content>
        </Layout>
      </ResizeHorizon>
    </Resize>
  );
};
export default App;
