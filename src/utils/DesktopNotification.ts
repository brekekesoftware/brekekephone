export const showNotification = async (body: string, tag: string) => {
  const notification = window.Brekeke.WebNotification
  const id = notification.showNotification({
    document,
    timeout: 15000,
    interval: 15000,
    title: 'Brekeke Phone',
    renotify: true,
    body,
    tag,
    icon: 'https://apps.brekeke.com/favicon.ico',
    noisiness: 1,
    onclick: (ev: any) => {
      window.focus()
    },
    onclose: (ev: any) => {
      notification.closeNotification({ notificationId: id })
    },
  })
}
