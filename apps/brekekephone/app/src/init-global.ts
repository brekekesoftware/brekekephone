import '#/utils/capture-console-output'
import '#/polyfill'
import '#/brekekejs/pal'
import '#/brekekejs/webrtcclient'
import '#/brekekejs/phonebook'
import '#/brekekejs/webnotification'
import '#/stores/ctx-imports'

import { initDarkModeNative } from '@/rn/core/dark-mode/index.native'
import { initTheme } from '@/rn/core/theme/config'
import { ctx } from '#/stores/ctx'
import { brekekeTheme } from '#/theme/brekeke'
import { registerValidatorLabels } from '#/utils/validator'
import { waitTimeout } from '#/utils/wait-timeout'

registerValidatorLabels()

// we dont need init theme native, since we use only 1 theme
// the init theme native is only useful if we want to switch between themes
initTheme([brekekeTheme], brekekeTheme)

initDarkModeNative().then(async () => {
  await waitTimeout()
  ctx.global.darkModeLoading = false
})
