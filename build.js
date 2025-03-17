const esbuild = require('esbuild');
const builtins = require('builtin-modules');

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv.includes('--prod');

esbuild.build({
  banner: {
    js: banner,
  },
  entryPoints: ['main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
    ...builtins],
  format: 'cjs',
  watch: !prod,
  target: 'es2018',
  logLevel: "info",
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
}).catch(() => process.exit(1));