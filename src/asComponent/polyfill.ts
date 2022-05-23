declare global {
  interface Window {
    _BrekekePhoneAsComponent: boolean
  }
}
window._BrekekePhoneAsComponent = true

if (!window.Brekeke) {
  // type-coverage:ignore-next-line
  window.Brekeke = {} as any
}
if (!window.Brekeke.Phone) {
  // type-coverage:ignore-next-line
  window.Brekeke.Phone = {} as any
}

// eslint-disable-next-line import/no-default-export
export default null
