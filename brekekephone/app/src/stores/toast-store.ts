import { makeAutoObservable } from 'mobx'
import { v4 as newUuid } from 'uuid'

import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import type { ErrorRnAlert } from '#/stores/rn-alert'
import { getConnectionStatus } from '#/utils/get-connection-status'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

type Toast = {
  id: string
  msg: string | undefined
  type: ToastType
  time?: number
  err?: Error
}

export class ToastStore {
  constructor() {
    makeAutoObservable(this)
  }

  items: Toast[] = []
  lastInternetToastTime = 0

  show = (
    msg: string | undefined,
    type: ToastType = 'info',
    time: number = 3000,
    err?: Error,
  ) => {
    const { message } = getConnectionStatus()
    if (!!message) {
      return
    }
    const id = newUuid()
    const toast: Toast = {
      id,
      msg,
      type,
      time,
      err,
    }
    this.items.push(toast)
    if (time > 0) {
      setTimeout(() => this.hide(id), time)
    }
  }

  hide = (id: string) => {
    this.items = this.items.filter(t => t.id !== id)
  }

  clearAll = () => {
    this.items = []
  }

  success = (msg: string, time?: number) => {
    this.show(msg, 'success', time)
  }

  error = (a: ErrorRnAlert, time?: number) => {
    // log error to save it to the debug log
    // convert error message to string if it was constructed using intlDebug
    const err = a.unexpectedErr || a.err
    const en = a.message?.en
    const msg = a.message?.label
    this.show(msg, 'error', time || 5000, err)

    if (err) {
      console.error(...(en ? [en, err] : [err]))
    }
  }

  warning = (msg: string, time?: number) => {
    this.show(msg, 'warning', time)
  }

  info = (msg: string, time?: number) => {
    this.show(msg, 'info', time)
  }

  internet = (err?: Error) => {
    const now = Date.now()
    const timeSinceLastToast = now - this.lastInternetToastTime
    // Only show if enough time has passed since last internet toast
    if (timeSinceLastToast >= 5000) {
      this.lastInternetToastTime = now
      this.error(
        {
          message: intlDebug`Internet connection failed`,
          err,
        },
        5000,
      )
    }
  }
}

ctx.toast = new ToastStore()
