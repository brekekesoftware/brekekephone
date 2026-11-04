module.exports = ({ types: t, template }) => {
  const hitTemplate = template(
    '((globalThis.__coverage__ = globalThis.__coverage__ || {})[FILE] = globalThis.__coverage__[FILE] || { s: {} }).s[INDEX] = 1;',
  )
  const reporter = template(`
    setInterval(function () {
      var hit = Object.keys(globalThis.__coverage__ || {});
      var s = hit.join(',');
      var log = globalThis.nativeLoggingHook;
      for (var n = 0; n * 3000 < s.length; n++) {
        log && log('COV ' + n + ' ' + s.slice(n * 3000, (n + 1) * 3000), 1);
      }
      log && log('COV-SUM hit=' + hit.length + ' bytes=' + s.length, 1);
    }, 10000);
  `)
  const fileOf = state => {
    const filename = state.filename || ''
    if (!filename.includes('/src/') || filename.includes('node_modules')) {
      return ''
    }
    return filename.slice(filename.lastIndexOf('/src/') + 1)
  }
  const instrument = (path, state) => {
    const file = fileOf(state)
    if (!file || !path.node.loc || !path.node.body) {
      return
    }
    if (!t.isBlockStatement(path.node.body)) {
      path.ensureBlock()
    }
    state.count = (state.count || 0) + 1
    path.node.body.body.unshift(
      hitTemplate({
        FILE: t.stringLiteral(file),
        INDEX: t.numericLiteral(state.count),
      }),
    )
  }
  return {
    visitor: {
      FunctionDeclaration: instrument,
      FunctionExpression: instrument,
      ArrowFunctionExpression: instrument,
      ObjectMethod: instrument,
      ClassMethod: instrument,
      Program: {
        exit(path, state) {
          if (fileOf(state) === 'src/index.ts') {
            path.pushContainer('body', reporter())
          }
        },
      },
    },
  }
}
