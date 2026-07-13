import '#/utils/capture-console-output'
import '#/polyfill'
import '#/embed/polyfill'
import '#/brekekejs/pal'
import '#/brekekejs/webrtcclient'
import '#/brekekejs/phonebook'
import '#/brekekejs/webnotification'
import '#/stores/ctx-imports'

import {
  darkModeCookieKey,
  darkModeDisabled,
} from '@rntwsc/rn/core/dark-mode/config'
import { initDarkModeNative } from '@rntwsc/rn/core/dark-mode/index.native'
import { initTheme } from '@rntwsc/rn/core/theme/config'
import { storage } from '@rntwsc/rn/storage'

import { ctx } from '#/stores/ctx'
import { brekekeTheme } from '#/theme/brekeke'
import { registerValidatorLabels } from '#/utils/validator'

const initGlobals = async () => {
  registerValidatorLabels()

  // we dont need init theme native, since we use only 1 theme
  // the init theme native is only useful if we want to switch between themes
  initTheme([brekekeTheme], brekekeTheme)

  const k = 'darkmode-backward-compatibility'
  if (!(await storage.getItem(k))) {
    await storage.setItem(k, '1')
    await storage.setItem(darkModeCookieKey, darkModeDisabled)
  }
  await initDarkModeNative()
  ctx.global.darkModeLoading = false
}

initGlobals()
