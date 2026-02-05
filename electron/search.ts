import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';

// Files/folders to ignore to improve performance and relevance
const IGNORED_NAMES = new Set([
    'node_modules',
    '.git',
    '.DS_Store',
    'dist',
    'build',
    'out',
    'coverage',
    '.vscode',
    '.idea',
    'tmp',
    'temp',
    'bin',
    'obj',
    'target' // Java/Rust/Maven
]);

const MAX_FILES = 10000; // Safety limit to prevent hanging on massive dirs during initial testing

interface FileResult {
    path: string;
    name: string;
}

async function scanDirectory(
    dir: string,
    rootPath: string,
    results: FileResult[]
): Promise<void> {
    if (results.length >= MAX_FILES) return;

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (IGNORED_NAMES.has(entry.name)) continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await scanDirectory(fullPath, rootPath, results);
            } else if (entry.isFile()) {
                // Calculate relative path for display/filtering??
                // For now, let's return absolute path and filename
                results.push({
                    path: fullPath,
                    name: entry.name
                });
            }
        }
    } catch (error) {
        console.warn(`Failed to access ${dir}:`, error);
    }
}

ipcMain.handle('search:get-all-files', async (event, rootPath: string) => {
    if (!rootPath) return [];
    console.log('Scanning files in:', rootPath);
    const results: FileResult[] = [];
    const start = performance.now();
    await scanDirectory(rootPath, rootPath, results);
    const end = performance.now();
    console.log(`Scanned ${results.length} files in ${(end - start).toFixed(2)}ms`);
    return results;
});
