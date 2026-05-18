import type { Platform } from 'react-native'
import type { TwConfig } from 'twrnc'
import { create } from 'twrnc/create'
import { parse } from 'yaml'

import { fs } from '@/nodejs/fs'
import { path } from '@/nodejs/path'
import { repoRoot } from '@/root'

// can not import twrnc directly as it imports react-native which is not available in nodejs babel env
export const createTwrnc = (
  platform: Platform['OS'],
  twrncConfig: TwConfig,
) => {
  const wsPath = path.join(repoRoot, 'pnpm-workspace.yaml')
  const wsFile = fs.readFileSync(wsPath, 'utf8')
  const { overrides } = parse(wsFile)
  const rnVersionStr = overrides['react-native']
  const matches = /(\d+)\.(\d+)\.(\d+)/.exec(rnVersionStr)
  if (!matches) {
    throw new Error('Can not parse react native version')
  }
  const rnVersion = {
    major: Number(matches[1]),
    minor: Number(matches[2]),
    patch: Number(matches[3]),
  }

  return create(twrncConfig, platform, rnVersion).style
}

export type Twrnc = ReturnType<typeof createTwrnc>
