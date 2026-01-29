import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const Terminal = ({ id }) => {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);

    useEffect(() => {
        // Initialize XTerm
        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff'
            }
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Notify main process to create PTY
        window.main.ipcRenderer.send('term.init', id);

        // Input from user -> Main
        term.onData(data => {
            window.main.ipcRenderer.send('term.input', { id, data });
        });

        // Resize handler
        const handleResize = () => {
            fitAddon.fit();
            const dims = { cols: term.cols, rows: term.rows };
            window.main.ipcRenderer.send('term.resize', { id, ...dims });
        };

        window.addEventListener('resize', handleResize);

        // Incoming data from Main -> XTerm
        const handleIncoming = (event, { id: incomingId, data }) => {
            if (incomingId === id) {
                term.write(data);
            }
        };

        window.main.ipcRenderer.on('term.incoming', handleIncoming);

        // Initial resize/fit
        setTimeout(() => handleResize(), 100);

        return () => {
            window.main.ipcRenderer.send('term.close', id);
            window.main.ipcRenderer.removeListener('term.incoming', handleIncoming);
            window.removeEventListener('resize', handleResize);
            term.dispose();
        }
    }, [id]);

    return (
        <div
            className="terminal-container"
            ref={terminalRef}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default Terminal;