import { exec } from 'child_process';
import path from 'path';

// Helper function to run git commands
const runGitCommand = (command: string, cwd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        // If the error is just that it's not a git repo, we might want to handle it gracefully for some commands
        // But for now, we'll reject.
        return reject(error);
      }
      resolve(stdout.trim());
    });
  });
};

/**
 * Get the current branch name.
 * @param {string} cwd - Current working directory (repo root).
 * @returns {Promise<string>} - The current branch name.
 */
export const getCurrentBranch = async (cwd: string): Promise<string | null> => {
  try {
    return await runGitCommand('git rev-parse --abbrev-ref HEAD', cwd);
  } catch (error) {
    console.error('Error getting current branch:', error);
    return null;
  }
};

/**
 * Get a list of all local branches.
 * @param {string} cwd - Current working directory.
 * @returns {Promise<string[]>} - Array of branch names.
 */
export const getBranches = async (cwd: string): Promise<string[]> => {
  try {
    const output = await runGitCommand('git branch --format="%(refname:short)"', cwd);
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error listing branches:', error);
    return [];
  }
};

/**
 * Stage a file or all files.
 * @param {string} cwd - Current working directory.
 * @param {string} file - File to stage (absolute path or relative to cwd). Use '.' for all files.
 * @returns {Promise<void>}
 */
export const stageFile = async (cwd: string, file = '.'): Promise<void> => {
  try {
    // If file is absolute, make it relative to cwd or just use it directly if git accepts absolute paths (it usually does but relative is safer)
    await runGitCommand(`git add "${file}"`, cwd);
  } catch (error) {
    console.error(`Error staging file ${file}:`, error);
    throw error;
  }
};

/**
 * Commit staged changes.
 * @param {string} cwd - Current working directory.
 * @param {string} message - Commit message.
 * @returns {Promise<string>} - Output of the commit command.
 */
export const commitChanges = async (cwd: string, message: string): Promise<string> => {
  try {
    // Escape quotes in message to prevent shell injection issues
    const escapedMessage = message.replace(/"/g, '\\"');
    return await runGitCommand(`git commit -m "${escapedMessage}"`, cwd);
  } catch (error) {
    console.error('Error committing changes:', error);
    throw error;
  }
};

/**
 * Get the status of the repository (files that are modified, untracked, etc.)
 * @param {string} cwd - Current working directory.
 * @returns {Promise<string>} - The status output.
 */
export const getStatus = async (cwd: string): Promise<string> => {
  try {
    return await runGitCommand('git status --porcelain', cwd);
  } catch (error) {
    console.error('Error getting status:', error);
    return '';
  }
};
