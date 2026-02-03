const os = require('os');
const pty = require('node-pty');
const { ipcMain } = require('electron');
const { getMainWindow } = require("./windowMain");

const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
const ptySessions = {};

ipcMain.on("trigger-new-terminal", () => {
    openTerminal();
});

// When renderer requests a new terminal session
ipcMain.on("term.init", (event, id) => {

    // Default to home directory
    // In future, could use 'cwd' from project
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptySessions[id] = ptyProcess;

    ptyProcess.on("data", (data) => {
        // Send output back to renderer. 
        // We use event.sender.send to ensure it goes to the right window, 
        // or just event.reply (which is safer/easier).
        event.reply("term.incoming", { id, data });
    });

    ptyProcess.on("exit", () => {
        // Optional: notify frontend that terminal closed
        // event.reply("term.exit", id);
    });
});

ipcMain.on("term.input", (event, { id, data }) => {
    if (ptySessions[id]) {
        ptySessions[id].write(data);
    }
});

ipcMain.on("term.resize", (event, { id, cols, rows }) => {
    if (ptySessions[id]) {
        ptySessions[id].resize(cols, rows);
    }
});

ipcMain.on("term.close", (event, id) => {
    if (ptySessions[id]) {
        ptySessions[id].kill();
        delete ptySessions[id];
    }
});


// Handlers for Menu actions

const openTerminal = () => {
    // This tells the frontend to "Create a new tab"
    getMainWindow().webContents.send("newTerminal", null);
}

const closeTerminal = () => {
    getMainWindow().webContents.send("closeTerminal", null);
}

module.exports = {
    openTerminal,
    closeTerminal
}