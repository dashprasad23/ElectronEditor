const Store = require('electron-store');

const store = new Store({
    name: 'electroneditor-config',
    defaults: {
        workspace: {
            currentPath: null,
            recentPaths: []
        },
        recentFiles: [],
        editorSettings: {
            fontSize: 14,
            theme: 'light'
        }
    }
});

// Generic storage methods
const saveData = (key, data) => {
    store.set(key, data);
}

const getData = (key) => {
    return store.get(key);
}

const deleteData = (key) => {
    return store.delete(key);
}

// Workspace-specific methods
const setCurrentWorkspace = (path) => {
    store.set('workspace.currentPath', path);
    addRecentWorkspace(path);
}

const getCurrentWorkspace = () => {
    return store.get('workspace.currentPath');
}

const clearCurrentWorkspace = () => {
    store.set('workspace.currentPath', null);
}

const addRecentWorkspace = (path) => {
    let recent = store.get('workspace.recentPaths') || [];
    // Remove if already exists
    recent = recent.filter(p => p !== path);
    // Add to beginning
    recent.unshift(path);
    // Keep only last 10
    recent = recent.slice(0, 10);
    store.set('workspace.recentPaths', recent);
}

const getRecentWorkspaces = () => {
    return store.get('workspace.recentPaths') || [];
}

const removeRecentWorkspace = (path) => {
    let recent = store.get('workspace.recentPaths') || [];
    recent = recent.filter(p => p !== path);
    store.set('workspace.recentPaths', recent);
    return recent;
}

// Recent files methods
const addRecentFile = (filePath) => {
    let recent = store.get('recentFiles') || [];
    recent = recent.filter(p => p !== filePath);
    recent.unshift(filePath);
    recent = recent.slice(0, 20);
    store.set('recentFiles', recent);
}

const getRecentFiles = () => {
    return store.get('recentFiles') || [];
}

// Editor settings
const setEditorSetting = (key, value) => {
    store.set(`editorSettings.${key}`, value);
}

const getEditorSetting = (key) => {
    return store.get(`editorSettings.${key}`);
}

// Get all store data (useful for debugging)
const getAllData = () => {
    return store.store;
}

// Clear all data
const clearAll = () => {
    store.clear();
}

module.exports = {
    // Generic methods
    saveData,
    getData,
    deleteData,

    // Workspace methods
    setCurrentWorkspace,
    getCurrentWorkspace,
    clearCurrentWorkspace,
    addRecentWorkspace,
    getRecentWorkspaces,
    removeRecentWorkspace,

    // Recent files
    addRecentFile,
    getRecentFiles,

    // Editor settings
    setEditorSetting,
    getEditorSetting,

    // Utility
    getAllData,
    clearAll,

    // Direct store access (for advanced use)
    store
}
