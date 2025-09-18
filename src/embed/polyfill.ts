import * as Mobx from 'mobx'
import * as MobxReact from 'mobx-react'
import * as React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { Platform } from 'react-native'

import { isWeb } from '#/config'

declare global {
  interface Window {
    _BrekekePhoneWebRoot?: HTMLElement | null
    _BrekekePhoneCaptureConsole?: boolean
    _BrekekePhoneEmbedImports: any
  }
}

export const isEmbed = Platform.OS === 'web' && !window._BrekekePhoneWebRoot
export const webRootId = '__brekeke_phone_web_root'

if (isWeb) {
  window._BrekekePhoneWebRoot = document.getElementById(webRootId)
  if (typeof window._BrekekePhoneCaptureConsole !== 'boolean') {
    window._BrekekePhoneCaptureConsole = !!window._BrekekePhoneWebRoot
  }
}
if (isEmbed) {
  window._BrekekePhoneEmbedImports = {
    mobx: Mobx,
    'mobx-react': MobxReact,
    react: React,
    'react-dom/client': ReactDOMClient,
  }
}

if (!window.Brekeke) {
  // type-coverage:ignore-next-line
  window.Brekeke = {} as any
}
if (!window.Brekeke.Phone) {
  // type-coverage:ignore-next-line
  window.Brekeke.Phone = {} as any
}
