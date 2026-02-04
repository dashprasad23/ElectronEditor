const { exec } = require('child_process');
const path = require('path');

// Helper function to run git commands
const runGitCommand = (command, cwd) => {
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
const getCurrentBranch = async (cwd) => {
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
const getBranches = async (cwd) => {
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
const stageFile = async (cwd, file = '.') => {
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
const commitChanges = async (cwd, message) => {
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
const getStatus = async (cwd) => {
  try {
    return await runGitCommand('git status --porcelain', cwd);
  } catch (error) {
    console.error('Error getting status:', error);
    return '';
  }
};

module.exports = {
  getCurrentBranch,
  getBranches,
  stageFile,
  commitChanges,
  getStatus
};
