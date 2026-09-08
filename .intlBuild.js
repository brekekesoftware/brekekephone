const fs = require('fs')

const currentEn = './src/assets/intl-en.json'
const currentJa = './src/assets/intl-ja.json'
const newEn = './.intlNewEn.json'

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

fs.writeFileSync(currentJa, JSON.stringify(ja2, null, 2) + '\n')
fs.writeFileSync(currentEn, JSON.stringify(en2, null, 2) + '\n')
