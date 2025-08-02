import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'es'
    },
    plugins: [nodeResolve()],
    external: ['child_process', 'fs', 'os', 'path']
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'default'
    },
    plugins: [nodeResolve()],
    external: ['child_process', 'fs', 'os', 'path']
  }
];