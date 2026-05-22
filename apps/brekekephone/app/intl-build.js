require('tsconfig-paths/register')
require('@/nodejs/entrypoint')({
  dir: __dirname,
})

const { fs } = require('@/nodejs/fs')

const currentEn = './src/assets/intl-en.json'
const currentJa = './src/assets/intl-ja.json'
const newEn = './intl-new-en.local.json'

const en = require(currentEn)
const ja = require(currentJa)
const en2 = require(newEn)

const enMap = en.reduce((m, l, i) => {
  m[l.toLowerCase()] = i
  return m
}, {})

const ja2 = []
en2.forEach((l, i) => {
  ja2[i] = ja[enMap[l.toLowerCase()]] || `**TRANSLATE**${l}`
})

fs.writeJsonSync(currentJa, ja2, { spaces: 2 })
fs.writeJsonSync(currentEn, en2, { spaces: 2 })
