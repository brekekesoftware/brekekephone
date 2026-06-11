import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { jsonStable } from '@rntwsc/shared/json-stable'

import { isEmbed } from '#/embed/polyfill'
import { ctx } from '#/stores/ctx'

let cache: { [k: string]: string } = {}

if (isWeb) {
  window.addEventListener('focus', () => {
    if (
      !isEmbed ||
      !ctx.embed._notificationOptions?.closeAllNotificationOnFocus
    ) {
      return
    }
    Object.values(cache).forEach(notificationId => {
      window.Brekeke.WebNotification.closeNotification({
        notificationId,
      })
    })
    cache = {}
  })
}

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
  window.Brekeke.WebNotification.closeNotification({
    notificationId,
  })
  delete cache[k]
}

export const webShowNotification = ({
  type,
  id,
  body,
  tag,
  title,
  timeout,
  interval,
}: {
  type: 'call' | 'chat'
  id: string
  body: string
  tag: string
  title?: string
  timeout?: number
  interval?: number
}) => {
  if (ctx.auth.pbxConfig?.['webphone.desktop.notification'] === 'false') {
    return
  }

  if (
    isEmbed &&
    ctx.embed._notificationOptions?.dontShowNotificationIfFocusing &&
    document.hasFocus()
  ) {
    return
  }

  if (!interval) {
    interval = 15000
    if (isEmbed && ctx.embed._notificationOptions?.notificationInterval) {
      interval = ctx.embed._notificationOptions.notificationInterval
    }
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
      notification.closeNotification({
        notificationId,
      })
      delete cache[k]
    },
    onclose: (e: unknown) => {
      notification.closeNotification({
        notificationId,
      })
      delete cache[k]
    },
  })
  cache[k] = notificationId
}
