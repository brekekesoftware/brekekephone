import { setChecker } from './PushNotification-parse';

const uint8ArrayToUrlBase64 = arr =>
  window
    .btoa(String.fromCharCode.apply(null, new Uint8Array(arr)))
    .replace(/[+/]/g, `-`);

const PushNotification = {
  register: fn => {
    if (!window.Notification || window.Notification.permission === `granted`) {
      return;
    }
    setChecker(fn);
    window.Notification.requestPermission();
  },
  getToken: async () => {
    const sw = await navigator.serviceWorker.ready;
    const sub =
      (await sw.pushManager.getSubscription()) ||
      (await sw.pushManager.subscribe({
        userVisibleOnly: true,
      }));
    return {
      endpoint: sub.endpoint,
      p256dh: uint8ArrayToUrlBase64(sub.getKey(`p256dh`)),
      auth: uint8ArrayToUrlBase64(sub.getKey(`auth`)),
    };
  },
  resetBadgeNumber: () => {
    // Polyfill
  },
};

export default PushNotification;
