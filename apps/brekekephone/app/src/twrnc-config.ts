import type { TwConfig } from 'twrnc'

import { twrncConfig as twrncCore } from '@/rn/core/twrnc-config'
import { mergeWithArray } from '@/shared/lodash'

const config: TwConfig = {
  theme: {
    extend: {
      borderRadius: {
        card: '8px',
        input: '8px',
        button: '9999px',
      },
    },
  },
}

export const twrncConfig: TwConfig = mergeWithArray({}, twrncCore, config)
