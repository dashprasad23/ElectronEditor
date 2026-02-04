import os from 'os';
import fs from 'fs';
import path from 'path';
// import pty from 'node-pty';
const pty = require('node-pty');
import { ipcMain, IpcMainEvent } from 'electron';
import { getMainWindow } from './windowMain';
import { getCurrentWorkspace } from './dataStore';

const ptySessions: { [key: string]: any } = {};

// Use absolute shell paths (important in Electron packaged apps)
function getShell() {
  if (process.platform === "win32") {
    // Prefer Windows PowerShell (works on most machines)
    const ps = path.join(
      process.env.SystemRoot || "C:\\Windows",
      "System32",
      "WindowsPowerShell",
      "v1.0",
      "powershell.exe"
    );
    if (fs.existsSync(ps)) return ps;

    // Fallback to cmd if powershell not found
    const cmd = path.join(
      process.env.SystemRoot || "C:\\Windows",
      "System32",
      "cmd.exe"
    );
    return cmd;
  }

  // macOS/Linux
  const envShell = process.env.SHELL;
  if (envShell && fs.existsSync(envShell)) return envShell;

  // Common fallbacks
  if (fs.existsSync("/bin/bash")) return "/bin/bash";
  if (fs.existsSync("/usr/bin/bash")) return "/usr/bin/bash";
  if (fs.existsSync("/bin/zsh")) return "/bin/zsh";
  return "/bin/sh";
}

const shell = getShell();

console.log("Platform:", os.platform());
console.log("Shell:", shell, "exists:", fs.existsSync(shell));

ipcMain.on("trigger-new-terminal", () => {
  console.log("Main Process: Triggering new terminal");
  openTerminal();
});

// Renderer requests a new terminal session
ipcMain.on("term.init", (event: IpcMainEvent, id: string) => {
  console.log(`Main Process: Initializing PTY session for ID ${id}`);

  try {
    const ptyProcess = pty.spawn(shell, [], {
      name: "xterm-256color",
      cols: 80,
      rows: 30,
      cwd: process.env.HOME || process.cwd(),
      env: { ...process.env, TERM: "xterm-256color" } as any,
    });

    ptySessions[id] = ptyProcess;

    const currentWorkSpace = getCurrentWorkspace();

    if (currentWorkSpace) {
      ptyProcess.write(`cd "${currentWorkSpace}"\r`);
    }

    (ptyProcess as any).on("data", (data: any) => {
      event.reply("term.incoming", { id, data });
    });

    // @ts-ignore
    (ptyProcess as any).on("error", (err: any) => {
      console.error(`Main Process: PTY error for session ${id}:`, err);
      event.reply("term.incoming", { id, data: `\r\n[PTY ERROR] ${err?.message}\r\n` });
    });

    (ptyProcess as any).on("exit", (exitCode: number, signal: number) => {
      console.log(
        `Main Process: PTY session ${id} exited with code ${exitCode}, signal ${signal}`
      );
      delete ptySessions[id];
    });

    console.log(`Main Process: PTY session ${id} spawned successfully`);
  } catch (err: any) {
    console.error(`Main Process: Failed to spawn PTY session ${id}:`, err);
    event.reply("term.incoming", {
      id,
      data: `\r\n[SPAWN FAILED] ${err?.message}\r\n`,
    });
  }
});

ipcMain.on("term.input", (event, { id, data }) => {
  const p = ptySessions[id];
  if (p) p.write(data);
  else console.warn(`Main Process: Input for non-existent PTY session ${id}`);
});

ipcMain.on("term.resize", (event, { id, cols, rows }) => {
  const p = ptySessions[id];
  if (p) p.resize(cols, rows);
});

ipcMain.on("term.close", (event, id) => {
  const p = ptySessions[id];
  if (p) {
    console.log(`Main Process: Closing PTY session ${id}`);
    try {
      p.kill();
    } catch (e) {
      console.warn("Kill error:", e);
    }
    delete ptySessions[id];
  }
});

// Menu actions helpers
export const openTerminal = () => {
  const win = getMainWindow();
  if (win) win.webContents.send("newTerminal", null);
  else console.error("Main Process: Cannot open terminal, no main window found");
};

export const closeTerminal = () => {
  const win = getMainWindow();
  if (win) win.webContents.send("closeTerminal", null);
};
