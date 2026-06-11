import { qsStableStringify } from '@/shared/qs'

const uint8ArrayToUrlBase64 = (arr: ArrayBuffer) =>
  window
    .btoa(
      String.fromCharCode.apply(null, new Uint8Array(arr) as any as number[]),
    )
    .replace(/[+/]/g, '-')

// on web this is not being used
// only to match typing with native
export const PushNotification: {
  register: (initApp: Function) => Promise<void>
  getToken: () => Promise<string>
  getVoipToken: () => Promise<string>
} = {
  register: async (initApp: Function) => {
    await initApp()
    if (!window.Notification || window.Notification.permission === 'granted') {
      return
    }
    window.Notification.requestPermission()
  },
  getToken: async () => {
    const sw = await navigator.serviceWorker.ready
    const sub =
      (await sw.pushManager.getSubscription()) ||
      (await sw.pushManager.subscribe({
        userVisibleOnly: true,
      }))
    return qsStableStringify({
      endpoint: sub.endpoint,
      p256dh: uint8ArrayToUrlBase64(sub.getKey('p256dh') as ArrayBuffer),
      auth: uint8ArrayToUrlBase64(sub.getKey('auth') as ArrayBuffer),
    })
  },
  getVoipToken: () => PushNotification.getToken(),
}
