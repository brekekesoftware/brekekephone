import type { Platform } from 'react-native'
import type { TwConfig } from 'twrnc'
import { create } from 'twrnc/create'

import packageJson from '../../../../package.json'

// can not import twrnc directly as it imports react-native which is not available in nodejs babel env
export const createTwrnc = (
  platform: Platform['OS'],
  twrncConfig: TwConfig,
) => {
  const rnVersionStr = packageJson.pnpm.overrides['react-native']
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
