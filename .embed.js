const fs = require('fs')
const path = require('path')

const b = path.join(__dirname, './build')
const contents = []

fs.readFileSync(path.join(b, './index.html'), 'utf-8')
  .split(/<\/script>/g)
  .forEach(v => {
    const src = v.match(/<script.+src="(.+)">$/)?.[1]
    if (src) {
      contents.push(fs.readFileSync(path.join(b, src), 'utf-8'))
      return
    }
    const content = v.match(/<script.*>(.+)$/)?.[1]
    if (content) {
      contents.push(content)
      return
    }
  })

if (!contents.length) {
  console.error('.embed.js error: can not find any script tag for embed api')
  process.exit(1)
}

console.log(`.embed.js total script tags: ${contents.length}`)
fs.writeFileSync(path.join(b, 'webphone.js'), contents.join(';\n'))
