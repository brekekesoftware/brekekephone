import babel from '@rolldown/plugin-babel'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)
const babelrc = require('./.babelrc')

const srcDir = path.join(__dirname, 'src')
const nullAlias = path.join(srcDir, 'polyfill/null.ts')
const assetExtensions = /\.(mp3|wav|png|jpe?g|gif|svg|ico)$/

// these packages ship untranspiled flow or jsx
const rawPackages = [
  '@react-native-community/push-notification-ios',
  'react-native-emoji-selector',
]
const babelExclude = new RegExp(
  `[\\\\/]node_modules[\\\\/](?!(${rawPackages.join('|')})[\\\\/])`,
)

// src still has a few lazy require() calls and the browser has no require
const requireToImport = (): Plugin => ({
  name: 'require-to-import',
  enforce: 'pre',
  transform(code, id) {
    if (!id.startsWith(srcDir) || !code.includes('require(')) {
      return
    }
    const imports: string[] = []
    const out = code.replace(/\brequire\((['"])(.+?)\1\)/g, (_, __, spec) => {
      const name = `__require${imports.length}`
      imports.push(
        assetExtensions.test(spec)
          ? `import ${name} from '${spec}'`
          : `import * as ${name} from '${spec}'`,
      )
      return name
    })
    return imports.length ? `${imports.join('\n')}\n${out}` : undefined
  },
})

export default defineConfig({
  base: './',
  plugins: [
    requireToImport(),
    {
      name: 'validatorjs-browser-build',
      enforce: 'pre',
      resolveId(id) {
        return id === 'validatorjs'
          ? this.resolve('validatorjs/dist/validator.js')
          : undefined
      },
    },
    babel({
      presets: [
        [
          'module:@react-native/babel-preset',
          {
            useTransformReactJSXExperimental: true,
            disableImportExportTransform: true,
          },
        ],
      ],
      plugins: babelrc.plugins,
      exclude: [/\0rolldown\/runtime\.js/, babelExclude],
    }),
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@d11/react-native-fast-image': 'react-native-web/dist/exports/Image',
      'react-native-linear-gradient': 'react-native-web-linear-gradient',
      'react-native-svg': 'react-native-svg-web',
      'react-native-callkeep': nullAlias,
      '@dr.pogodin/react-native-fs': nullAlias,
      'react-native-incall-manager': nullAlias,
      'react-native-share': nullAlias,
      'react-native-bootsplash': nullAlias,
      'react-native-background-timer': nullAlias,
      '@react-native-documents/picker': nullAlias,
    },
    extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
    // patches/react-native-web+*.patch edits dist/cjs, the esm build would skip it
    mainFields: ['browser', 'main'],
  },
  build: {
    outDir: 'build',
    rolldownOptions: {
      // web variants miss some native-only exports, webpack gave undefined for them
      shimMissingExports: true,
      output: {
        format: 'iife',
      },
    },
  },
  // the dev pre-bundler does not use resolve.*; flow packages must go through babel
  optimizeDeps: {
    exclude: rawPackages,
    rolldownOptions: {
      resolve: {
        extensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
        mainFields: ['browser', 'main'],
      },
    },
  },
  // page-relative like CRA: the module script has no currentScript, and embed rewrites relative paths
  experimental: { renderBuiltUrl: filename => `./${filename}` },
})
