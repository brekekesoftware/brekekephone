require('@rntwsc/nodejs/entrypoint')({
  target: __dirname,
})

const cheerio = require('cheerio')
const { fs } = require('@rntwsc/nodejs/fs')
const { path } = require('@rntwsc/nodejs/path')
const { jsonSafe } = require('@rntwsc/shared/json-safe')

const buildPath = path.join(__dirname, './build')
const b = p => path.join(buildPath, p)

const stats = {
  scriptSrc: 0,
  scriptContent: 0,
  linkStylesheet: 0,
  inlineStyle: 0,
}

const html = fs.readFileSync(b('./index.html'), 'utf-8')
const $ = cheerio.load(html)

const cssContents = []

$('link[rel="stylesheet"]').each((_, el) => {
  const href = $(el).attr('href')
  if (href) {
    stats.linkStylesheet++
    const css = fs.readFileSync(b(href), 'utf-8')
    cssContents.push(css)
  }
})

$('style').each((_, el) => {
  const css = $(el).html().trim()
  if (css) {
    stats.inlineStyle++
    cssContents.push(css)
  }
})

const jsContents = cssContents.map(
  v =>
    `var s=document.createElement('style');s.textContent=${jsonSafe(v)};document.head.appendChild(s);`,
)

$('script').each((_, el) => {
  const src = $(el).attr('src')
  if (src) {
    stats.scriptSrc++
    jsContents.push(fs.readFileSync(b(src), 'utf-8'))
    return
  }
  const content = $(el).html().trim()
  if (content) {
    stats.scriptContent++
    jsContents.push(content)
  }
})

if (!jsContents.length) {
  console.error('embed-build.js error: no content found')
  process.exit(1)
}

const stat = `
embed-build.js stats:
  script[src]: ${stats.scriptSrc}
  script[content]: ${stats.scriptContent}
  link[stylesheet]: ${stats.linkStylesheet}
  style[inline]: ${stats.inlineStyle}
`
console.log(stat)
fs.writeFileSync(b('./webphone.js'), jsContents.join(';'))
