// nodejs code here

import { path } from '@rntwsc/nodejs/path'
import { twConfig as twCore } from '@rntwsc/rn/core/tw-config'
import { mergeWithArray } from '@rntwsc/shared/lodash'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [path.join(__dirname, './**/*.{ts,tsx}')],
}

export const twConfig: Config = mergeWithArray({}, twCore, config)
