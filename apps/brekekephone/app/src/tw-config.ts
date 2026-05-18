// nodejs code here

import type { Config } from 'tailwindcss'

import { path } from '@/nodejs/path'
import { twConfig as twCore } from '@/rn/core/tw-config'
import { mergeWithArray } from '@/shared/lodash'

const config: Config = {
  content: [path.join(__dirname, './**/*.{ts,tsx}')],
}

export const twConfig: Config = mergeWithArray({}, twCore, config)
