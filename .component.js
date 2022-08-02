const fs = require('fs')
const path = require('path')

const b = path.join(__dirname, './build')
const contents = []

fs.readFileSync(path.join(b, './index.html'), 'utf-8')
  .split(/<\/script>/g)
  .forEach(v => {
    const content = v.match(/<script>(.+)$/)?.[1]
    if (content) {
      contents.push(content)
      return
    }
    const src = v.match(/<script src="(.+)">$/)?.[1]
    if (!src) {
      return
    }
    contents.push(fs.readFileSync(path.join(b, src), 'utf-8'))
  })

if (!contents.length) {
  console.error(
    '.component.js error: can not find any script tag for component api',
  )
  process.exit(1)
}

console.log(`.component.js total script tags: ${contents.length}`)
fs.writeFileSync(path.join(b, 'webphone.js'), contents.join(';\n'))

const p = path.join(__dirname, './public')
fs.copyFileSync(
  ...[p, b].map(d => path.join(d, './webphone_embed_example.html')),
)
