/* eslint-disable */

if (!window.Brekeke) {
  window.Brekeke = {}
}
var Brekeke = window.Brekeke

/**
 * instance Brekeke.WebrtcClient
 */
if (!Brekeke.WebNotification) {
  Brekeke.WebNotification = {}
}
const WebNotification = {}
var debug = function () {}
;(notificationIdCounter = 0), (notificationInfoTable = {})
/**
 * requestPermission function: request permission from the user to display notifications
 *  parameters:
 *   (the parameters below are optional)
 *   options.document: document object
 *   options.callback: called with the permission value (granted, denied, default or error)
 */
WebNotification.requestPermission = function (options) {
  var targetDocument
  var targetWindow

  options = options || {}
  targetDocument = options.document || document
  targetWindow = (targetDocument && targetDocument.defaultView) || window
  if (
    !targetWindow ||
    !targetWindow.Notification ||
    !targetWindow.Notification.requestPermission
  ) {
    console.info('Notifications API not supported')
    if (options.callback) {
      options.callback('error')
    }
    return
  }
  targetWindow.Notification.requestPermission(function (result) {
    if (options.callback) {
      options.callback(result)
    }
  })
}

/**
 * showNotification function: show a notification
 *  parameters:
 *   (the parameters below are optional)
 *   options.document: document object
 *   options.timeout:  timeout millisecond before the notification closes automatically (default: 86400000)
 *   options.interval: interval millisecond for the notification blinking (default: 3000)
 *   options.title:    title
 *   options.body:     body text
 *   options.icon:     URL of icon
 *   options.tag:      tag (default: location.href)
 *   options.noisiness:whether sounds or vibrations should be issued (0: silent, 1: once, 2: every) (default: 0)
 *   options.onclick:  click event handler
 *   options.onclose:  close event handler
 *   options.debug:    debug log function (static)
 *   options.renotify:  A boolean value specifying whether the user should be notified after a new notification replaces an old one. The default is false, which means they won't be notified.
 *  returns:
 *   ID of the notification
 *  throws:
 *   Error
 */
WebNotification.showNotification = function (options) {
  var targetDocument
  var targetWindow
  var timeout
  var interval
  var title
  var opt
  var id
  var notification

  options = options || {}
  debug = typeof options.debug === 'function' ? options.debug : debug
  targetDocument = options.document || document
  targetWindow = (targetDocument && targetDocument.defaultView) || window
  if (!targetWindow || !targetWindow.Notification) {
    throw new Error('Notifications API not supported')
  }
  timeout = int(options.timeout) || 86400000
  interval = int(options.interval) || 3000
  title = string(options.title)
  noisiness = int(options.noisiness)
  opt = {
    tag: string(
      options.tag ||
        (targetWindow.location && targetWindow.location.href) ||
        'webnotification.js',
    ),
    silent: noisiness === 0,
    body: string(options.body),
    renotify: options.renotify,
  }
  if (options.icon) {
    opt.icon = string(options.icon)
  }

  id = string(++notificationIdCounter)
  notification = new targetWindow.Notification(title, opt)
  if (!notification) {
    throw new Error('failed to create notification')
  }
  notification.onclick = notification_onclick.bind({ notificationId: id })
  notification.onclose = notification_onclose.bind({ notificationId: id })
  opt.silent = noisiness === 0 || noisiness === 1
  notificationInfoTable[id] = {
    notificationId: id,
    notification,
    reshowing: false,
    timeoutTimer: setTimeout(
      WebNotification.closeNotification.bind(this, {
        notificationId: id,
        reason: '_TIMEOUT',
      }),
      timeout,
    ),
    targetWindow,
    interval,
    title,
    opt,
    onclick: options.onclick,
    onclose: options.onclose,
  }

  setTimeout(closeAndReshow.bind({ notificationId: id }), interval)

  debug('WebNotification started (' + id + ')')

  return id
}

/**
 * closeNotification function: close the specified notification or all notifications
 *  parameters:
 *   (the parameters below are optional)
 *   options.notificationId: ID of the notification (default: all notifications)
 *   options.reason:         reason string for log
 */
WebNotification.closeNotification = function (options) {
  var notificationInfo

  debug(
    'WebNotification stopping (' +
      (options && options.notificationId) +
      ') reason: ' +
      (options && options.reason),
  )

  Object.keys(notificationInfoTable).forEach(function (id) {
    if (
      !options ||
      options.notificationId == null ||
      options.notificationId === id
    ) {
      notificationInfo = notificationInfoTable[id]
      if (notificationInfo) {
        clearTimeout(notificationInfo.timeoutTimer)
        if (notificationInfo.notification) {
          var notification = notificationInfo.notification
          var onclose = notificationInfo.onclose
          notificationInfo.onclick = null
          notificationInfo.onclose = null
          notificationInfo.notification = null
          notification.onclick = null
          notification.onclose = null
          if (notification.close) {
            notification.close()
          }
          if (onclose) {
            onclose({
              notificationId: id,
            })
          }
        }
      }
      delete notificationInfoTable[id]

      debug(
        'WebNotification stopped (' +
          id +
          ') reason: ' +
          (options && options.reason),
      )
    }
  })
}

/**
 * private functions
 */
var notification_onclick = function () {
  var id = string(this && this.notificationId)
  var notificationInfo = notificationInfoTable[id]

  debug('WebNotification notification_onclick occurred (' + id + ')')

  if (notificationInfo && notificationInfo.onclick) {
    notificationInfo.onclick({
      notificationId: id,
    })
  }
}

var notification_onclose = function () {
  var id = string(this && this.notificationId)
  var notificationInfo = notificationInfoTable[id]

  debug(
    'WebNotification notification_onclose occurred (' +
      id +
      ') reshowing: ' +
      (notificationInfo && notificationInfo.reshowing),
  )

  if (notificationInfo && notificationInfo.notification) {
    if (notificationInfo.reshowing) {
      // reshow
      notificationInfo.reshowing = false
      notificationInfo.notification.onclick = null
      notificationInfo.notification.onclose = null
      notificationInfo.notification =
        new notificationInfo.targetWindow.Notification(
          notificationInfo.title,
          notificationInfo.opt,
        )
      if (!notificationInfo.notification) {
        console.error('failed to create notification @ notification_onclose')
        return
      }
      notificationInfo.notification.onclick = notification_onclick.bind({
        notificationId: id,
      })
      notificationInfo.notification.onclose = notification_onclose.bind({
        notificationId: id,
      })
      setTimeout(
        closeAndReshow.bind({ notificationId: id }),
        notificationInfo.interval,
      )
    } else {
      // close
      WebNotification.closeNotification({
        notificationId: id,
        reason: '_ONCLOSE',
      })
    }
  }
}

var closeAndReshow = function () {
  var id = string(this && this.notificationId)
  var notificationInfo = notificationInfoTable[id]

  debug(
    'WebNotification closeAndReshow occurred (' +
      id +
      ') close: ' +
      (notificationInfo &&
        notificationInfo.notification &&
        typeof notificationInfo.notification.close),
  )

  if (
    notificationInfo &&
    notificationInfo.notification &&
    notificationInfo.notification.close
  ) {
    notificationInfo.reshowing = true
    notificationInfo.notification.close()
  }
}

var int = function (value) {
  return parseInt(value, 10) || 0
}

var string = function (value) {
  return String(value || value === 0 || value === false ? value : '')
}
Brekeke.WebNotification = WebNotification
