// reexport config at root to be compatible with vscode intellisense
// shortcut to run devtools scripts
require('@rntwsc/nodejs/entrypoint')({
  target: __dirname,
  env: true,
  alias: false,
})
