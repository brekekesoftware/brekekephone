import * as Mobx from 'mobx'
import * as MobxReact from 'mobx-react'
// eslint-disable-next-line custom/no-import-default
import * as React from 'react'
import * as ReactDOMClient from 'react-dom/client'

import { isWeb } from '@/rn/core/utils/platform'

declare global {
  interface Window {
    _BrekekePhoneWebRoot?: HTMLElement | null
    _BrekekePhoneCaptureConsole?: boolean
    _BrekekePhoneEmbedImports: any
  }
}

export const webRootId = '__brekeke_phone_web_root'
window._BrekekePhoneWebRoot = document.getElementById(webRootId)
export const isEmbed = isWeb && !window._BrekekePhoneWebRoot

if (typeof window._BrekekePhoneCaptureConsole !== 'boolean') {
  window._BrekekePhoneCaptureConsole = !!window._BrekekePhoneWebRoot
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
