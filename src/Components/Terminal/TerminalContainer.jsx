import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import Terminal from './Terminal';

const TerminalContainer = () => {
  // Start with one terminal by default
  const [terminals, setTerminals] = useState([{ id: '1', key: '1' }]);
  const [activeKey, setActiveKey] = useState('1');

  useEffect(() => {
    const handleNewTerminal = () => {
      setTerminals(prev => {
        const newId = String(Date.now());
        const newTerms = [...prev, { id: newId, key: newId }];
        setActiveKey(newId);
        return newTerms;
      });
    };

    const handleCloseTerminal = () => {
      setTerminals([]);
    };

    window.main.ipcRenderer.on('newTerminal', handleNewTerminal);
    window.main.ipcRenderer.on('closeTerminal', handleCloseTerminal);

    return () => {
      window.main.ipcRenderer.removeListener('newTerminal', handleNewTerminal);
      window.main.ipcRenderer.removeListener('closeTerminal', handleCloseTerminal);
    };
  }, []);

  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey);
    }
  };

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    terminals.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = terminals.filter((item) => item.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setTerminals(newPanes);
    setActiveKey(newActiveKey);
  };

  if (terminals.length === 0) {
    return <div style={{ padding: 20, color: '#ccc', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No open terminals. Go to Terminal -> New Terminal to open one.</div>;
  }

  return (
    <Tabs
      style={{ height: '100%' }}
      tabPosition="top"
      type="editable-card"
      activeKey={activeKey}
      onChange={onChange}
      onEdit={onEdit}
      items={terminals.map((item, i) => {
        return {
          label: `Terminal ${i + 1}`,
          key: item.key,
          children: <Terminal id={item.id} />,
          closable: true
        };
      })}
    />
  );
};

export default TerminalContainer;