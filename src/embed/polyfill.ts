import { Platform } from 'react-native'

declare global {
  interface Window {
    _BrekekePhoneWebRoot: HTMLElement | null
  }
}

window._BrekekePhoneWebRoot =
  Platform.OS === 'web'
    ? document.getElementById('__web_phone_not_as_component_api')
    : null

if (!window.Brekeke) {
  // type-coverage:ignore-next-line
  window.Brekeke = {} as any
}
if (!window.Brekeke.Phone) {
  // type-coverage:ignore-next-line
  window.Brekeke.Phone = {} as any
}
