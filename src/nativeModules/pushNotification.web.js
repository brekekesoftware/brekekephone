const uint8ArrayToUrlBase64 = arr => {
  return window
    .btoa(String.fromCharCode.apply(null, new Uint8Array(arr)))
    .replace(/[+/]/g, '-');
};

export const getPnToken = async () => {
  const sw = await navigator.serviceWorker.ready;
  const sub =
    (await sw.pushManager.getSubscription()) ||
    (await sw.pushManager.subscribe({
      userVisibleOnly: true,
    }));
  return {
    endpoint: sub.endpoint,
    p256dh: uint8ArrayToUrlBase64(sub.getKey('p256dh')),
    auth: uint8ArrayToUrlBase64(sub.getKey('auth')),
  };
};

export const registerPn = () => {
  if (!window.Notification || window.Notification.permission === 'granted') {
    return;
  }
  Notification.requestPermission();
};

export const resetBadgeNumber = () => {
  // Polyfill
};
