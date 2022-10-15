export const showNotification = async (body: string) => {
  const notification = window.Brekeke.WebNotification
  const id = notification.showNotification({
    document,
    timeout: 15000,
    interval: -1,
    title: 'Brekeke Phone',
    body,
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
