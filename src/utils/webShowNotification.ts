import { getAuthStore } from '../stores/authStore'

export const webShowNotification = async (body: string, tag: string) => {
  if (getAuthStore().pbxConfig?.['webphone.desktop.notification'] === 'false') {
    return
  }
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
    onclick: (e: unknown) => {
      window.focus()
    },
    onclose: (e: unknown) => {
      notification.closeNotification({ notificationId: id })
    },
  })
}
