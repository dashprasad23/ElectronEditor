import React from 'react';
import {Layout,theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import classes from './AppHeader.module.scss';
const { Header } = Layout;

const AppHeader = (props) => {
    const {
        token: { colorBgContainer },
      } = theme.useToken();
    return (
        <Header
        style={{
          padding: 0,
          background: colorBgContainer,
        }}
      >
        {React.createElement(props.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: classes.Trigger,
          onClick: () => props.setCollapsed(),
        })}
      </Header>
    );

}

export default AppHeader;