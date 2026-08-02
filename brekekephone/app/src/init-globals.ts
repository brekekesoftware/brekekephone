import '@/polyfill'
import '@/embed/polyfill'
import '@/brekekejs/pal'
import '@/brekekejs/webrtcclient'
import '@/brekekejs/phonebook'
import '@/brekekejs/webnotification'
import '@/stores/ctx-imports'

import { darkModeCookieKey, darkModeDisabled } from 'rntwsc/dark-mode/config'
import { initDarkModeNative } from 'rntwsc/dark-mode/index.native'
import { initI18n } from 'rntwsc/i18n/config'
import { storage } from 'rntwsc/libs/storage'
import { initTheme } from 'rntwsc/theme/config'

import { ctx } from '@/stores/ctx'
import { brekekeTheme } from '@/theme/brekeke'
import { registerValidatorLabels } from '@/utils/validator'

const initGlobals = async () => {
  registerValidatorLabels()

  // we dont need init theme native, since we use only 1 theme
  // the init theme native is only useful if we want to switch between themes
  initTheme([brekekeTheme], brekekeTheme)

  // we have our own i18n babel plugin and store
  // only setup for compatible and later usage
  initI18n(['en'], {})

  const k = 'darkmode-backward-compatibility'
  if (!(await storage.getItem(k))) {
    await storage.setItem(k, '1')
    await storage.setItem(darkModeCookieKey, darkModeDisabled)
  }
  await initDarkModeNative()
  ctx.global.darkModeLoading = false
}

initGlobals()
