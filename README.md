# rollup-plugin-git-info

A Rollup plugin that injects git commit and branch information at build time, perfect for displaying debug information in your applications.

## Installation

```bash
npm install --save-dev rollup-plugin-git-info
```

## Usage

### Basic Setup

Add the plugin to your `rollup.config.js`:

```javascript
import gitInfo from 'rollup-plugin-git-info';

export default {
  // ... your config
  plugins: [
    gitInfo(),
    // ... other plugins
  ]
};
```

### Using in Your Code

```javascript
import gitInfo from 'virtual:git-info';

console.log(gitInfo);
// {
//   commit: "1a2b3c4d5e6f7g8h9i0j...",
//   shortCommit: "1a2b3c4",
//   branch: "main",
//   isDirty: false,
//   version: "1.2.3",
//   buildHostname: "build-server-01",
//   buildTime: "2025-07-31T10:30:00.000Z"
// }
```

### Svelte Example

```svelte
<script>
  import gitInfo from 'virtual:git-info';
</script>

<div class="debug-info">
  <h3>Build Info</h3>
  <p>Version: {gitInfo.version}</p>
  <p>Branch: {gitInfo.branch}</p>
  <p>Commit: {gitInfo.shortCommit}</p>
  <p>Built: {new Date(gitInfo.buildTime).toLocaleString()}</p>
  <p>Host: {gitInfo.buildHostname}</p>
  {#if gitInfo.isDirty}
    <p class="warning">⚠️ Built with uncommitted changes</p>
  {/if}
</div>
```

## Options

```javascript
gitInfo({
  // Custom virtual module name (default: 'virtual:git-info')
  moduleName: 'virtual:my-git-info',
  
  // Fallback values when git is unavailable (default shown)
  fallback: {
    commit: 'unknown',
    branch: 'unknown',
    shortCommit: 'unknown',
    version: 'unknown'
  },
  
  // Path to package.json (default: './package.json')
  packagePath: './package.json',
  
  // Suppress console output (default: false)
  silent: true
})
```

## Data Structure

The plugin provides the following information:

- `commit`: Full git commit hash
- `shortCommit`: First 7 characters of the commit hash
- `branch`: Current branch name
- `isDirty`: Boolean indicating if there are uncommitted changes
- `version`: Version from package.json
- `buildHostname`: Hostname of the machine where the build occurred
- `buildTime`: ISO timestamp of when the build occurred

## TypeScript Support

TypeScript definitions are included. For the virtual module, types are automatically available when you import:

```typescript
import gitInfo from 'virtual:git-info';
// gitInfo is properly typed with GitInfo interface
```

## Requirements

- Node.js 14+
- Git repository (falls back to default values if not available)
- Rollup 2+

## Framework Compatibility

This plugin works with any Rollup-based build system:
- ✅ Svelte/SvelteKit
- ✅ Vite
- ✅ WMR
- ✅ Vanilla Rollup setups

## License

MIT