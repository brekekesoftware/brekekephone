import type { PluginPass } from '@babel/core'
import type { Platform } from 'react-native'

import { fs } from '@/nodejs/fs'
import { path } from '@/nodejs/path'
import { get } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export const twFn = {
  tw: 'tw',
  cva: 'cva',
  clsx: 'clsx',
}

export const getPlatform = (pluginPass: PluginPass): Platform['OS'] =>
  (process.env._MOCK_PLATFORM_OS as any) ||
  get(pluginPass, 'file.opts.caller.platform') ||
  'web'

export const normalizeTwExtractOutputPath = (p: string) =>
  p.endsWith('.json') ? p : path.join(p, './src/codegen/class-names.min.json')

export const readTwExtractOutput = (p: string) => {
  if (!process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES) {
    return
  }
  p = normalizeTwExtractOutputPath(p)
  return fs.readJsonSync(p)
}

export const writeTwExtractOutput = (p: string, min: StrMap<string>) => {
  if (!process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES) {
    return
  }
  p = normalizeTwExtractOutputPath(p)
  return fs.writeJsonSync(p, min)
}
