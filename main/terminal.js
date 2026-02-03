const os = require('os');
const pty = require('node-pty');
const { ipcMain } = require('electron');
const { getMainWindow } = require("./windowMain");

const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || 'bash');
const ptySessions = {};

ipcMain.on("trigger-new-terminal", () => {
    console.log("Main Process: Triggering new terminal");
    openTerminal();
});

// When renderer requests a new terminal session
ipcMain.on("term.init", (event, id) => {
    console.log(`Main Process: Initializing PTY session for ID ${id}`);

    try {
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: os.homedir(),
            env: process.env
        });

        ptySessions[id] = ptyProcess;

        ptyProcess.on("data", (data) => {
            // Send output back specifically to the sender of the init event
            event.reply("term.incoming", { id, data });
        });

        ptyProcess.on("exit", (exitCode, signal) => {
            console.log(`Main Process: PTY session ${id} exited with code ${exitCode}, signal ${signal}`);
            delete ptySessions[id];
        });

        console.log(`Main Process: PTY session ${id} spawned successfully`);
    } catch (err) {
        console.error(`Main Process: Failed to spawn PTY session ${id}:`, err);
    }
});

ipcMain.on("term.input", (event, { id, data }) => {
    if (ptySessions[id]) {
        ptySessions[id].write(data);
    } else {
        console.warn(`Main Process: Input received for non-existent PTY session ${id}`);
    }
});

ipcMain.on("term.resize", (event, { id, cols, rows }) => {
    if (ptySessions[id]) {
        ptySessions[id].resize(cols, rows);
    }
});

ipcMain.on("term.close", (event, id) => {
    if (ptySessions[id]) {
        console.log(`Main Process: Closing PTY session ${id}`);
        ptySessions[id].kill();
        delete ptySessions[id];
    }
});


// Handlers for Menu actions

const openTerminal = () => {
    const win = getMainWindow();
    if (win) {
        win.webContents.send("newTerminal", null);
    } else {
        console.error("Main Process: Cannot open terminal, no main window found");
    }
}

const closeTerminal = () => {
    const win = getMainWindow();
    if (win) {
        win.webContents.send("closeTerminal", null);
    }
}

module.exports = {
    openTerminal,
    closeTerminal
}