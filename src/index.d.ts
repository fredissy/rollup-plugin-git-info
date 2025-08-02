export interface GitInfo {
    /** Full git commit hash */
    commit: string;
    /** Short git commit hash (first 7 characters) */
    shortCommit: string;
    /** Current git branch name */
    branch: string;
    /** Whether the working directory has uncommitted changes */
    isDirty: boolean;
    /** Version from package.json */
    version: string;
    /** Hostname of the machine where the build occurred */
    buildHostname: string;
    /** ISO timestamp of when the build occurred */
    buildTime: string;
  }
  
  export interface GitInfoPluginOptions {
    /** The virtual module name to use for imports @default 'virtual:git-info' */
    moduleName?: string;
    /** Fallback values when git is not available */
    fallback?: {
      /** Fallback commit hash @default 'unknown' */
      commit?: string;
      /** Fallback branch name @default 'unknown' */
      branch?: string;
      /** Fallback short commit hash @default 'unknown' */
      shortCommit?: string;
      /** Fallback version when package.json is not found @default 'unknown' */
      version?: string;
    };
    /** Suppress console output @default false */
    silent?: boolean;
    /** Path to package.json file @default './package.json' */
    packagePath?: string;
  }
  
  export interface RollupPlugin {
    name: string;
    buildStart(): void;
    resolveId(id: string): string | null | undefined;
    load(id: string): string | null | undefined;
  }
  
  /**
   * A Rollup plugin that injects git commit and branch information at build time
   */
  declare function gitInfoPlugin(options?: GitInfoPluginOptions): RollupPlugin;
  
  export default gitInfoPlugin;
  
  // Ambient module declaration for the virtual module
  declare module 'virtual:git-info' {
    const gitInfo: GitInfo;
    export default gitInfo;
  }