import type { TwConfig } from 'twrnc'

import { twrncConfig as twrncCore } from '@/rn/core/twrnc-config'
import { mergeWithArray } from '@/shared/lodash'

const config: TwConfig = {
  theme: {
    extend: {
      borderRadius: {
        button: '3px',
        modal: '3px',
        card: '3px',
      },
    },
  },
}

export const twrncConfig: TwConfig = mergeWithArray({}, twrncCore, config)
