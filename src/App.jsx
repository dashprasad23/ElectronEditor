import React, { useEffect, useState } from "react";
import classes from "./App.scss";
import Sidebar from "./Components/Sidebar";
import { Layout } from "antd";
import { ResizeHorizon, Resize, ResizeVertical } from "react-resize-layout";
import CodeEditor from "./Components/CodeEditor/CodeEditor";
const { Content } = Layout;
const App = () => {
  const [showTerminal, setTerminalStatus] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  window.main.ipcRenderer.on("newTerminal", () => {
    setTerminalStatus(true)
  });

  window.main.ipcRenderer.on("closeTerminal", () => {
    setTerminalStatus(false)
  })


  return (
    <Resize handleWidth="5px" handleColor="#1677ff">
      <ResizeVertical>
        <Resize handleWidth="5px" handleColor="#1677ff">
          <ResizeHorizon width="30vw">
            <Sidebar collapsed={collapsed} />
          </ResizeHorizon>
          <ResizeHorizon width="200px" minWidth="150px">
            <Layout className={classes.MainLayout}>
              <Content>
                <CodeEditor />
              </Content>
            </Layout>
          </ResizeHorizon>
        </Resize>
      </ResizeVertical>
      {showTerminal && <ResizeVertical  minHeight="50px">Vertical 3</ResizeVertical>}
    </Resize>
  );
};
export default App;
