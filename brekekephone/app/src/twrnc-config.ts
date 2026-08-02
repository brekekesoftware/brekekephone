import { mergeWithArray } from 'rntwsc/libs/lodash'
import { twrncConfig as twrncCore } from 'rntwsc/tw/twrnc-config'
import type { TwConfig } from 'twrnc'

const config: TwConfig = {
  theme: {
    extend: {
      borderRadius: {
        card: '8px',
        input: '8px',
        button: '8px',
      },
    },
  },
}

export const twrncConfig: TwConfig = mergeWithArray({}, twrncCore, config)
