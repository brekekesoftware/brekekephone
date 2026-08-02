import ssl from '@vitejs/plugin-basic-ssl'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PluginContext } from 'rolldown'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

const require = createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))
require('tsx/cjs')
const { transformSync } = require('@babel/core')
const { getAlias } = require('rntwsc/devtools/babel-config/get-alias')
const babel = require('../app/babel.config')

// same override as craco.config.js: point module-resolver at web's own tsconfig paths
babel.plugins.forEach((p: any) => {
  if (!Array.isArray(p)) {
    return
  }
  if (typeof p[0] !== 'string') {
    return
  }
  if (!p[0].includes('module-resolver')) {
    return
  }
  p[1].alias = getAlias(__dirname, {
    relative: true,
  })
})

// keep ESM output for Vite dev (native ESM has no `require` shim), Metro is unaffected
babel.presets.forEach((p: any) => {
  if (!Array.isArray(p)) {
    return
  }
  if (typeof p[0] !== 'string') {
    return
  }
  if (!p[0].includes('react-native/babel-preset')) {
    return
  }
  p[1].disableImportExportTransform = true
})

const appDir = path.join(__dirname, '../app')
const nullAlias = path.join(appDir, 'src/polyfill/null.ts')

// rntwsc aliases for browser variants
const browsers = require('rntwsc/devtools/next-config/browser-variants.json')

const resolvePackage = (specifier: string, from?: string) =>
  require.resolve(
    specifier,
    from
      ? {
          paths: [from],
        }
      : undefined,
  )
const browserVariantAliases = Object.entries(browsers).map(([find, to]) => {
  const regex = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return {
    find: new RegExp(`^${regex}$`),
    replacement: resolvePackage(to as string),
  }
})

// lets `.svg` imports skip the `?react` suffix, matching the `.native.ts` counterpart
// where Metro's own svg transformer always returns a component with no suffix needed
const autoSvgReactPlugin = (): Plugin => ({
  name: 'auto-svg-react',
  enforce: 'pre',
  resolveId(this: PluginContext, source, importer) {
    if (!importer || !/\.svg$/.test(source)) {
      return
    }
    return this.resolve(`${source}?react`, importer, {
      skipSelf: true,
    })
  },
})

// the dep-optimizer scanner bypasses resolve.alias, patch the same stub in via a rolldown plugin
const toastAndroidStubPath = path.join(__dirname, 'src/toast-android-stub.ts')
const injectToastAndroidPlugin: Plugin = {
  name: 'inject-toast-android',
  transform: (code, id) => {
    if (!/react-native-web[/\\]dist[/\\]index\.js$/.test(id)) {
      return
    }
    const fs = require('node:fs')
    return code + '\n' + fs.readFileSync(toastAndroidStubPath, 'utf-8')
  },
}

// rntwsc is TS source compiled by the same babel pipeline as app/src (its `tw` tagged
// templates are meant to be stripped by twPlugin, not executed), the optimizer's own
// rolldown pass skips our main Vite plugin, so give it the same transform here too
const rntwscBabelPlugin: Plugin = {
  name: 'rntwsc-babel',
  transform: (code, id) => {
    if (!/[/\\]rntwsc[/\\].*\.tsx?$/.test(id)) {
      return
    }
    const result = transformSync(code, {
      babelrc: false,
      cwd: appDir,
      filename: id,
      ...babel,
    })
    return result?.code
  },
}

const shouldBabelTransform = (id: string) =>
  /\.tsx?$/.test(id) ||
  /brekekejs/.test(id) ||
  id.includes('push-notification-ios')

const babelTransformPlugin = (): Plugin => ({
  name: 'brekeke-babel',
  enforce: 'pre',
  transform: (code, id) => {
    if (!shouldBabelTransform(id)) {
      return
    }
    const result = transformSync(code, {
      babelrc: false,
      // string plugin names (module-resolver, react-native preset) are app/ devDependencies
      cwd: appDir,
      filename: id,
      sourceMaps: true,
      ...babel,
    })
    if (!result?.code) {
      return
    }
    return {
      code: result.code,
      map: result.map,
    }
  },
})

const rolldownChecks = {
  // ucclient.js's `module.exports =` is intentionally guarded with a
  // `typeof module !== 'undefined'` check for Metro/CJS consumers
  commonJsVariableInEsm: false,
  // informational only, brekeke-babel/svgr are expected to dominate
  pluginTimings: false,
}

export default defineConfig(({ mode }) => ({
  plugins: [
    babelTransformPlugin(),
    autoSvgReactPlugin(),
    svgr(),
    ...(process.env.HTTPS ? [ssl()] : []),
  ],
  resolve: {
    alias: [
      // unused native codegen helper, gated by isWeb already in root-view.tsx
      {
        find: 'react-native/Libraries/Utilities/codegenNativeComponent',
        replacement: nullAlias,
      },
      // helper only reachable from app/src, not a top-level web/ dependency
      {
        find: '@babel/runtime',
        replacement: path.dirname(
          resolvePackage('@babel/runtime/package.json'),
        ),
      },
      // exact match only, RegExp since Rolldown doesn't honor the `'foo$'` shorthand
      {
        find: /^react-native$/,
        replacement: path.join(__dirname, 'src/react-native-web-shim.ts'),
      },
      // package root (not dist/index.js) so `react-native/Libraries/...` still resolves
      {
        find: 'react-native',
        replacement: path.dirname(
          resolvePackage('react-native-web/package.json'),
        ),
      },
      // nested under react-native-web's own node_modules, not web/'s
      {
        find: 'invariant',
        replacement: path.dirname(
          resolvePackage(
            'invariant/package.json',
            path.dirname(resolvePackage('react-native-web/package.json')),
          ),
        ),
      },
      {
        find: 'react-native-fast-image',
        replacement: resolvePackage('react-native-web/dist/exports/Image'),
      },
      {
        find: 'react-native-linear-gradient',
        replacement: resolvePackage('react-native-web-linear-gradient'),
      },
      {
        find: 'react-native-svg',
        replacement: resolvePackage('react-native-svg-web'),
      },
      {
        find: 'react-native-callkeep',
        replacement: nullAlias,
      },
      {
        find: 'react-native-fs',
        replacement: nullAlias,
      },
      {
        find: 'react-native-incall-manager',
        replacement: nullAlias,
      },
      {
        find: 'react-native-share',
        replacement: nullAlias,
      },
      {
        find: 'react-native-splash-screen',
        replacement: nullAlias,
      },
      {
        find: 'react-native-background-timer',
        replacement: nullAlias,
      },
      {
        find: '@react-native-documents/picker',
        replacement: nullAlias,
      },
      // android/ios-only, gated by isAndroid/isIos, its own `lodash` require isn't reachable
      {
        find: 'react-native-notifications',
        replacement: nullAlias,
      },
      // rntwsc aliases
      ...browserVariantAliases,
      {
        find: 'next-unchecked/navigation',
        replacement: nullAlias,
      },
    ],
    extensions: [
      // try to resolve `.web.*` first
      '.web.js',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.ts',
      '.tsx',
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    // CRA/webpack polyfilled Node's `global`, Vite doesn't
    global: 'globalThis',
  },
  optimizeDeps: {
    // native-only code paths never reached on web, but the scanner validates them eagerly
    exclude: [
      '@react-native-community/netinfo',
      '@react-native-community/push-notification-ios',
    ],
    rolldownOptions: {
      // optimizer has its own resolver, separate from resolve.extensions above
      resolve: {
        extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
      },
      plugins: [injectToastAndroidPlugin, rntwscBabelPlugin],
      checks: rolldownChecks,
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: Infinity,
    rolldownOptions: {
      checks: rolldownChecks,
    },
  },
  base: './',
}))
