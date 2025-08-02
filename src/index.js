import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { hostname } from 'os';
import { resolve } from 'path';

/**
 * A Rollup plugin that injects git commit and branch information at build time
 * @param {Object} options - Plugin options
 * @param {string} [options.moduleName='virtual:git-info'] - The virtual module name to use for imports
 * @param {Object} [options.fallback] - Fallback values when git is not available
 * @param {string} [options.fallback.commit='unknown'] - Fallback commit hash
 * @param {string} [options.fallback.branch='unknown'] - Fallback branch name
 * @param {string} [options.fallback.shortCommit='unknown'] - Fallback short commit hash
 * @param {string} [options.fallback.version='unknown'] - Fallback version when package.json is not found
 * @param {boolean} [options.silent=false] - Suppress console output
 * @param {string} [options.packagePath='./package.json'] - Path to package.json file
 * @returns {Object} Rollup plugin object
 */
export default function gitInfoPlugin(options = {}) {
  const {
    moduleName = 'virtual:git-info',
    fallback = {
      commit: 'unknown',
      branch: 'unknown',
      shortCommit: 'unknown',
      version: 'unknown'
    },
    silent = false,
    packagePath = './package.json'
  } = options;

  let gitInfo = { ...fallback };

  return {
    name: 'git-info',
    
    buildStart() {
      // Get build hostname
      const buildHostname = hostname();

      // Get version from package.json
      let version = fallback.version;
      try {
        const packageJsonPath = resolve(packagePath);
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          version = packageJson.version || fallback.version;
        } else if (!silent) {
          console.warn(`rollup-plugin-git-info: package.json not found at ${packageJsonPath}`);
        }
      } catch (error) {
        if (!silent) {
          console.warn('rollup-plugin-git-info: Failed to read package.json:', error.message);
        }
      }

      // Check if we're in a git repository
      if (!existsSync('.git')) {
        if (!silent) {
          console.warn('rollup-plugin-git-info: Not in a git repository, using fallback values');
        }
        gitInfo = { 
          ...fallback, 
          version,
          buildHostname,
          buildTime: new Date().toISOString() 
        };
        return;
      }

      try {
        // Get current commit hash
        const commit = execSync('git rev-parse HEAD', { 
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore'] // Suppress stderr
        }).trim();
        
        // Get short commit hash (first 7 characters)
        const shortCommit = commit.substring(0, 7);
        
        // Get current branch name
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { 
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
        
        // Check if working directory is dirty (has uncommitted changes)
        let isDirty = false;
        try {
          const status = execSync('git status --porcelain', { 
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore']
          }).trim();
          isDirty = status.length > 0;
        } catch (e) {
          // Ignore errors when checking dirty status
        }
        
        gitInfo = {
          commit,
          shortCommit,
          branch,
          isDirty,
          version,
          buildHostname,
          buildTime: new Date().toISOString()
        };

        if (!silent) {
          const dirtyFlag = isDirty ? ' (dirty)' : '';
          console.log(`rollup-plugin-git-info: Built v${version} with commit ${shortCommit} on branch ${branch}${dirtyFlag} at ${buildHostname}`);
        }
      } catch (error) {
        if (!silent) {
          console.warn('rollup-plugin-git-info: Failed to read git info:', error.message);
        }
        gitInfo = { 
          ...fallback, 
          version,
          buildHostname,
          buildTime: new Date().toISOString(), 
          isDirty: false 
        };
      }
    },

    resolveId(id) {
      if (id === moduleName) {
        return id;
      }
    },

    load(id) {
      if (id === moduleName) {
        return `export default ${JSON.stringify(gitInfo, null, 2)};`;
      }
    }
  };
}
