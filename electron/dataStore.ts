import Store from 'electron-store';

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
export const saveData = (key: string, data: any) => {
    store.set(key, data);
}

export const getData = (key: string) => {
    return store.get(key as any);
}

export const deleteData = (key: string) => {
    return store.delete(key as any);
}

// Workspace-specific methods
export const addRecentWorkspace = (path: string) => {
    let recent = (store.get('workspace.recentPaths') as string[]) || [];
    // Remove if already exists
    recent = recent.filter(p => p !== path);
    // Add to beginning
    recent.unshift(path);
    // Keep only last 10
    recent = recent.slice(0, 10);
    store.set('workspace.recentPaths', recent);
}

export const setCurrentWorkspace = (path: string) => {
    store.set('workspace.currentPath', path);
    addRecentWorkspace(path);
}

export const getCurrentWorkspace = () => {
    return store.get('workspace.currentPath');
}

export const clearCurrentWorkspace = () => {
    store.set('workspace.currentPath', null);
}

export const getRecentWorkspaces = () => {
    return store.get('workspace.recentPaths') || [];
}

export const removeRecentWorkspace = (path: string) => {
    let recent = (store.get('workspace.recentPaths') as string[]) || [];
    recent = recent.filter(p => p !== path);
    store.set('workspace.recentPaths', recent);
    return recent;
}

// Recent files methods
export const addRecentFile = (filePath: string) => {
    let recent = (store.get('recentFiles') as string[]) || [];
    recent = recent.filter(p => p !== filePath);
    recent.unshift(filePath);
    recent = recent.slice(0, 20);
    store.set('recentFiles', recent);
}

export const getRecentFiles = () => {
    return store.get('recentFiles') || [];
}

// Editor settings
export const setEditorSetting = (key: string, value: any) => {
    store.set(`editorSettings.${key}`, value);
}

export const getEditorSetting = (key: string) => {
    return store.get(`editorSettings.${key}`);
}

// Get all store data (useful for debugging)
export const getAllData = () => {
    return store.store;
}

// Clear all data
export const clearAll = () => {
    store.clear();
}

export { store };
