// 2026-10-28: the real enc link key must reach the bundle at build time, never a tracked file.
const path = require('path')
const { execFileSync } = require('child_process')
const t = require('@babel/core').types

const key = execFileSync(
  'bash',
  [path.join(__dirname, '.claude/scripts/enc-key-get.sh')],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
).trim()
if (Buffer.byteLength(key, 'utf8') !== 32) {
  throw new Error('enc link key must be 32 bytes')
}

module.exports = () => ({
  visitor: {
    ReferencedIdentifier(p) {
      if (p.node.name === '__ENC_LINK_KEY__') {
        p.replaceWith(t.stringLiteral(key))
      }
    },
  },
})
module.exports.keyHash = require('crypto')
  .createHash('sha256')
  .update(key)
  .digest('hex')
  .slice(0, 16)
