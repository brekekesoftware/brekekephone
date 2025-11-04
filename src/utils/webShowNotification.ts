import { embedApi } from '#/embed/embedApi'
import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'
import { jsonStable } from '#/utils/jsonStable'

let cache: { [k: string]: string } = {}

window.addEventListener('focus', () => {
  if (!isEmbed) {
    return
  }
  if (!embedApi._notificationOptions?.closeAllNotificationOnFocus) {
    return
  }
  Object.values(cache).forEach(notificationId => {
    window.Brekeke.WebNotification.closeNotification({ notificationId })
  })
  cache = {}
})

export const webCloseNotification = ({
  type,
  id,
}: {
  type: 'call' | 'chat'
  id: string
}) => {
  const k = jsonStable({
    type,
    id,
  })
  const notificationId = cache[k]
  if (!notificationId) {
    return
  }
  window.Brekeke.WebNotification.closeNotification({ notificationId })
  delete cache[k]
}

export const webShowNotification = ({
  type,
  id,
  body,
  tag,
  title,
  timeout,
}: {
  type: 'call' | 'chat'
  id: string
  body: string
  tag: string
  title?: string
  timeout?: number
}) => {
  if (ctx.auth.pbxConfig?.['webphone.desktop.notification'] === 'false') {
    return
  }
  if (
    isEmbed &&
    embedApi._notificationOptions?.dontShowNotificationIfFocusing &&
    document.hasFocus()
  ) {
    return
  }
  let interval = 15000
  if (isEmbed && embedApi._notificationOptions?.notificationInterval) {
    interval = embedApi._notificationOptions.notificationInterval
  }
  const k = jsonStable({
    type,
    id,
  })
  const notification = window.Brekeke.WebNotification
  const notificationId = notification.showNotification({
    document,
    timeout,
    interval,
    title: title ? title : ctx.global.productName,
    renotify: true,
    body,
    tag,
    icon: 'https://dev01.brekeke.com/favicon.ico',
    noisiness: 1,
    onclick: (e: unknown) => {
      window.focus()
      notification.closeNotification({ notificationId })
      delete cache[k]
    },
    onclose: (e: unknown) => {
      notification.closeNotification({ notificationId })
      delete cache[k]
    },
  })
  cache[k] = notificationId
}
