export default async function subscribePn (serverKey) {
  const sw = await navigator.serviceWorker.ready
  let sub = await sw.pushManager.getSubscription()
  if (!sub) {
    sub = await sw.pushManager.subscribe({
      userVisibleOnly: true
    })
  }
  return Promise.resolve(sub)
}
