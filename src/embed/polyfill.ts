import { Platform } from 'react-native'

declare global {
  interface Window {
    _BrekekePhoneWebRoot?: HTMLElement | null
    _BrekekePhoneCaptureConsole?: boolean
  }
}

export const webRootId = '__brekeke_phone_web_root'
export const getWebRootIdProps = () => {
  return Platform.OS === 'web' && !window._BrekekePhoneWebRoot
    ? { id: webRootId }
    : undefined
}

if (Platform.OS === 'web') {
  window._BrekekePhoneWebRoot = document.getElementById(webRootId)
  if (typeof window._BrekekePhoneCaptureConsole !== 'boolean') {
    window._BrekekePhoneCaptureConsole = !!window._BrekekePhoneWebRoot
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
