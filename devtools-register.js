// reexport config at root to be compatible with vscode intellisense

const paths = () => {
  // treat json extension as json5 to import json with comments
  require('json5/lib/register')
  const exts = require.extensions
  Object.assign(exts, { '.json': exts['.json5'] })
  return require('./tsconfig.json').compilerOptions.paths
}

// current working directory can be different in vscode shell
// we need to call register manually instead of tsconfig-paths/register
require('tsconfig-paths').register({
  paths: paths(),
  baseUrl: __dirname,
  cwd: __dirname,
})

require('@/nodejs/entrypoint')({
  dir: __dirname,
  env: true,
})
