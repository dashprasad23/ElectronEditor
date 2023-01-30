import { Tabs } from 'antd';
import Terminal from './Terminal';
const TerminalContainer = (props) => {

  return (
    <>
      <Tabs
        style={{height:'100%'}}
        tabPosition="right"
        items={new Array(props.terminalCount).fill(null).map((_, i) => {
          const id = String(i + 1);
          return {
            label: `Terminal ${id}`,
            key: id,
            children: <Terminal/>,
          };
        })}
      />
    </>
  );
};
export default TerminalContainer;