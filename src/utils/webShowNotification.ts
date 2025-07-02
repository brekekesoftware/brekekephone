import { ctx } from '#/stores/ctx'

export const webShowNotification = async (body: string, tag: string) => {
  if (ctx.auth.pbxConfig?.['webphone.desktop.notification'] === 'false') {
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
    icon: 'https://dev01.brekeke.com/favicon.ico',
    noisiness: 1,
    onclick: (e: unknown) => {
      window.focus()
    },
    onclose: (e: unknown) => {
      notification.closeNotification({ notificationId: id })
    },
  })
}
