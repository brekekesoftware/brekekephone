import { ctx } from '#/stores/ctx'

export const webShowNotification = async (
  body: string,
  tag: string,
  title?: string,
  timeout?: number,
) => {
  if (ctx.auth.pbxConfig?.['webphone.desktop.notification'] === 'false') {
    return
  }
  const notification = window.Brekeke.WebNotification
  const id = notification.showNotification({
    document,
    timeout,
    interval: 15000,
    title: title ? title : ctx.global.productName,
    renotify: true,
    body,
    tag,
    icon: 'https://dev01.brekeke.com/favicon.ico',
    noisiness: 1,
    onclick: (e: unknown) => {
      window.focus()
      notification.closeNotification({ notificationId: id })
    },
    onclose: (e: unknown) => {
      notification.closeNotification({ notificationId: id })
    },
  })
}
