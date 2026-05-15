import type { TwConfig } from 'twrnc'

import { twrncConfig as twrncCore } from '@/rn/core/twrnc-config'
import { mergeWithArray } from '@/shared/lodash'

const config: TwConfig = {
  //
}

export const twrncConfig: TwConfig = mergeWithArray({}, twrncCore, config)
