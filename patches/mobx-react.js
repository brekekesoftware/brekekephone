const fs = require('node:fs')
const { globbySync } = require('globby')

globbySync('node_modules/mobx-react/dist/**/*.js').forEach(f => {
  let c = fs.readFileSync(f, 'utf-8')
  if (!c.includes('_allowStateChanges')) {
    return
  }
  c = c.replaceAll('_allowStateChanges(!1', '_allowStateChanges(true')
  c = c.replaceAll('_allowStateChanges(false', '_allowStateChanges(true')
  fs.writeFileSync(f, c)
})
