/** @param {{dir: string, env?: true, babel?: true, req?: string}} options */
module.exports = options => {
  // try to load .env and .env.example all together from dir up to root
  if (options.env) {
    const path = require('node:path')
    const { repoRoot } = require('@/root')

    // transpiler is not registered yet, can not import typescript, need to copy from `@/nodejs/path`
    /** @param {string} p */
    const isInRepo = p => !path.relative(repoRoot, p).startsWith('.')
    /** @param {string} d */
    const isRepoRoot = d => !path.relative(repoRoot, d)

    /** @type {string[]} */
    const envDirs = []
    let currentDir = options.dir
    if (isInRepo(currentDir)) {
      while (isInRepo(currentDir)) {
        envDirs.push(currentDir)
        currentDir = path.dirname(currentDir)
      }
    } else {
      envDirs.push(currentDir)
    }
    if (!envDirs.some(isRepoRoot)) {
      envDirs.push(repoRoot)
    }

    const fs = require('node:fs')
    const dotenv = require('dotenv')

    for (const f of ['./.env', './.env.example']) {
      for (const d of envDirs) {
        const e = path.join(d, f)
        if (!fs.existsSync(e)) {
          continue
        }
        dotenv.config({
          path: e,
          override: false,
          debug: false,
          quiet: true,
        })
      }
    }
  }

  // register json5 if not yet
  const exts = require.extensions
  if (!exts['.json5']) {
    require('json5/lib/register')
    // treat json extension as json5 to import json with comments
    Object.assign(exts, { '.json': exts['.json5'] })
  }

  // register transpiler to be able to import typescript
  if (options.babel) {
    require('@babel/register')(require('@/nodejs/babelrc'))
  } else {
    require('ts-node').register({ transpileOnly: true })
  }

  // now we should be able to import typescript from now on
  // check shortcut to require another module in this call
  if (!options.req) {
    return
  }

  // clear stdout
  if (process.env.NODE_ENV === 'development') {
    process.stdout.write(
      process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H',
    )
  }

  // global error handlers
  const { log } = require('@/nodejs/log')
  process.on('uncaughtException', log.stack)
  process.on('unhandledRejection', log.stack)

  // check circular imports
  /** @type {import('@/nodejs/circular-imports') | undefined} */
  let circularImports
  if (process.env.NODE_ENV === 'development') {
    circularImports = require('@/nodejs/circular-imports')
    setImmediate(circularImports.check)
  }
  circularImports?.setEntryPoint(options.req)

  // require and return
  try {
    return require(options.req)
  } catch (err) {
    log.stack(err, 'fatal')
  }
  return
}
