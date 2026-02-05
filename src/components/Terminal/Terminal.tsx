import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface TerminalProps {
    id: string;
}

const Terminal: React.FC<TerminalProps> = ({ id }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const { theme } = useSelector((state: RootState) => state.settings);

    // Define themes
    const lightTheme = {
        background: '#ffffff',
        foreground: '#000000',
        cursor: '#1677ff',
        selectionBackground: 'rgba(22, 119, 255, 0.2)',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
    };

    const darkTheme = {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#1677ff',
        selectionBackground: 'rgba(22, 119, 255, 0.2)',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
    };

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const currentTheme = isDark ? darkTheme : lightTheme;

    // Theme sync effect
    useEffect(() => {
        if (xtermRef.current) {
            xtermRef.current.options.theme = currentTheme;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme, isDark]); // Re-run when theme changes

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize XTerm with current theme
        const term = new XTerm({
            cursorBlink: true,
            theme: currentTheme, // Use calculated theme on init
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 14,
            lineHeight: 1.2
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();
        term.focus();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        console.log(`Renderer: Initializing terminal ${id}`);

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
        const handleIncoming = (event: any, { id: incomingId, data }: { id: string, data: string }) => {
            if (incomingId === id) {
                term.write(data);
            }
        };

        window.main.ipcRenderer.on('term.incoming', handleIncoming);

        // Initial resize/fit
        setTimeout(() => handleResize(), 100);

        return () => {
            console.log(`Renderer: Disposing terminal ${id}`);
            window.main.ipcRenderer.send('term.close', id);
            window.main.ipcRenderer.removeListener('term.incoming', handleIncoming);
            window.removeEventListener('resize', handleResize);
            term.dispose();
            xtermRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Keep dependency array clean to avoid re-init

    return (
        <div
            className="terminal-container"
            ref={terminalRef}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default Terminal;