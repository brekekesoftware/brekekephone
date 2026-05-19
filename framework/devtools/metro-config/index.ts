import { getDefaultConfig } from '@react-native/metro-config'
import { makeMetroConfig } from '@rnx-kit/metro-config'
import MetroSymlinksResolver from '@rnx-kit/metro-resolver-symlinks'

import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'

type Options = {
  dir: string
}

export const config = ({ dir }: Options) => {
  const defaultConfig = getDefaultConfig(dir)
  const { assetExts, sourceExts } = defaultConfig.resolver

  return makeMetroConfig({
    projectRoot: dir,
    watchFolders: [repoRoot],
    resolver: {
      nodeModulesPaths: [
        path.resolve(dir, 'node_modules'),
        path.resolve(repoRoot, 'node_modules'),
      ],
      resolveRequest: MetroSymlinksResolver({
        resolver: 'enhanced-resolve',
      }),
      unstable_conditionNames: ['react-native', 'import', 'require', 'default'],
      assetExts: assetExts.filter(e => e !== 'svg' && e !== 'css'),
      sourceExts: [...sourceExts, 'svg', 'css'],
    },
    transformer: {
      babelTransformerPath: require.resolve('./transformer'),
      getTransformOptions: () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
  })
}
