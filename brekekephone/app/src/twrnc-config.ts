import { twrncConfig as twrncCore } from '@rntwsc/rn/core/twrnc-config'
import { mergeWithArray } from '@rntwsc/shared/lodash'
import type { TwConfig } from 'twrnc'

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
