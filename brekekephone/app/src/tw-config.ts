// nodejs code here

import { path } from 'rntwsc/devtools/path'
import { mergeWithArray } from 'rntwsc/libs/lodash'
import { config as twCore } from 'rntwsc/tw/tailwind-config'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [path.join(__dirname, './**/*.{ts,tsx}')],
}

export const twConfig: Config = mergeWithArray({}, twCore, config)
