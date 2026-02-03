# Electron Editor

A modern, lightweight, and extensible code editor built with Electron and React.

![Electron Editor](public/appIcon.png)

## Features

- 🚀 **Fast & Lightweight** - Built with performance in mind
- 📁 **Workspace Management** - Open folders and manage multiple files
- 💾 **Recent Workspaces** - Quick access to your last 3 workspaces
- 🎨 **Syntax Highlighting** - Powered by CodeMirror with support for multiple languages
- 🖥️ **Integrated Terminal** - Built-in terminal with full shell support
- 🎯 **File Operations** - Create, rename, and delete files/folders
- ⌨️ **Keyboard Shortcuts** - Efficient workflow with keyboard shortcuts
- 💻 **Cross-Platform** - Available for macOS, Windows, and Linux

## Screenshots

### Welcome Screen
- Quick access to recent workspaces
- Keyboard shortcuts reference
- Clean, modern interface

### Editor View
- Syntax highlighting for multiple languages
- File tree navigation
- Integrated terminal
- Tab-based file management

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ElectronEditor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will automatically:
   - Install all required packages
   - Rebuild `node-pty` for your platform using `electron-rebuild`

3. **Run in development mode**
   ```bash
   npm run dev
   ```

## Development

### Available Scripts

#### `npm run dev`
Runs the app in development mode with hot-reloading enabled.
- React dev server starts on `http://localhost:3000`
- Electron window opens automatically

#### `npm start`
Runs only the React development server (without Electron).

#### `npm run build`
Builds the React app for production to the `build` folder.

#### `npm test`
Launches the test runner in interactive watch mode.

## Building & Packaging

### Quick Build

```bash
# Build for your current platform
npm run dist

# Test packaging without creating installers
npm run pack
```

### Platform-Specific Builds

#### macOS
```bash
npm run dist:mac
```
Creates:
- `.dmg` installer (Intel x64 + Apple Silicon arm64)
- `.zip` archive

#### Windows
```bash
npm run dist:win
```
Creates:
- NSIS installer (`.exe`) with installation wizard
- Portable executable (`.exe`)
- Both 64-bit and 32-bit versions

#### Linux
```bash
npm run dist:linux
```
Creates:
- AppImage (portable, works on most distros)
- `.deb` package (Debian/Ubuntu)
- `.rpm` package (Fedora/RedHat/CentOS)

### Output

All build artifacts are created in the `dist/` directory:

```
dist/
├── Electron Editor-0.1.0.dmg          # macOS installer
├── Electron Editor Setup 0.1.0.exe    # Windows installer
├── Electron Editor 0.1.0.exe          # Windows portable
├── Electron Editor-0.1.0.AppImage     # Linux portable
├── electron-editor_0.1.0_amd64.deb    # Debian/Ubuntu
└── electron-editor-0.1.0.x86_64.rpm   # Fedora/RedHat
```

## Keyboard Shortcuts

### General
- `Cmd/Ctrl + O` - Open Folder
- `Cmd/Ctrl + S` - Save File
- `Cmd/Ctrl + Shift + W` - Close Workspace
- `Cmd/Ctrl + W` - Close Window

### Terminal
- `Cmd/Ctrl + T` - New Terminal
- `Cmd/Ctrl + \`` - Toggle Terminal

### Editor
- Click files in sidebar to open
- Close tabs with the X button
- Switch between tabs by clicking

## Project Structure

```
ElectronEditor/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js          # Preload script
│   └── AppIcons/           # Application icons
├── main/
│   ├── dataStore.js        # Persistent storage (electron-store)
│   ├── filesystem.js       # File operations
│   ├── terminal.js         # Terminal integration (node-pty)
│   ├── Menu.js             # Application menu
│   └── windowMain.js       # Window management
├── src/
│   ├── components/         # React components
│   │   ├── CodeEditor/    # Code editor component
│   │   ├── WelcomeScreen/ # Welcome screen
│   │   ├── Terminal/      # Terminal UI
│   │   └── Files/         # File tree
│   ├── store/             # Redux store
│   └── App.jsx            # Main React component
└── package.json
```

## Technologies Used

### Frontend
- **React** - UI framework
- **Redux Toolkit** - State management
- **Material-UI** - Component library
- **CodeMirror** - Code editor
- **SCSS** - Styling

### Backend (Electron)
- **Electron** - Desktop app framework
- **node-pty** - Terminal emulation
- **electron-store** - Persistent storage
- **xterm** - Terminal UI

### Build Tools
- **electron-builder** - Application packaging
- **electron-rebuild** - Native module rebuilding
- **react-scripts** - React build tools

## Features in Detail

### Workspace Management
- Open any folder as a workspace
- Automatically saves workspace to history
- Quick access to last 3 workspaces from welcome screen
- Close workspace with `Cmd/Ctrl + Shift + W`

### File Operations
- Create new files and folders
- Rename files and folders
- Delete files and folders
- File tree with folder expansion/collapse

### Integrated Terminal
- Full shell support (bash, zsh, PowerShell, etc.)
- Multiple terminal instances
- Runs in the context of your workspace

### Code Editor
- Syntax highlighting for multiple languages
- Tab-based interface
- Auto-save support
- Empty state with helpful tips

## Troubleshooting

### node-pty Build Issues

If you encounter issues with `node-pty` after installation:

```bash
# Manually rebuild
npx electron-rebuild -f -w node-pty

# Or reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails

1. Clear previous builds:
   ```bash
   rm -rf dist build
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Try building again:
   ```bash
   npm run dist
   ```

### Terminal Not Working

Ensure `node-pty` is properly built for your platform:
```bash
npx electron-rebuild -f -w node-pty
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/) and [Material-UI](https://mui.com/)
- Code editing with [CodeMirror](https://codemirror.net/)
- Terminal emulation with [node-pty](https://github.com/microsoft/node-pty) and [xterm.js](https://xtermjs.org/)
