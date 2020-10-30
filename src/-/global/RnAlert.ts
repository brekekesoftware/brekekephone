import { action, observable } from 'mobx'
import { ReactElement } from 'react'

import { IntlDebug } from '../intl/intl'

type CommonRnAlertFields = {
  confirmText?: string | boolean
  dismissText?: string | boolean
}

export type PromptRnAlert = CommonRnAlertFields & {
  title: string | ReactElement
  message: string | ReactElement
  onConfirm?: Function
  onDismiss?: Function
}
export type ErrorRnAlert = CommonRnAlertFields & {
  message?: IntlDebug
  err?: Error
  unexpectedErr?: Error
}
export type ErrorRnAlert2 = Omit<ErrorRnAlert, 'message'> & {
  message?: string
}

export type RnAlert =
  | {
      prompt: PromptRnAlert
    }
  | {
      error: ErrorRnAlert2
    }

export class RnAlertStore {
  // Need to put `alerts` out of the observable
  //  because ReactElement can not stay in the mobx state
  @observable alertsCount = 0
  alerts: RnAlert[] = []

  @action prompt = (prompt: PromptRnAlert) => {
    this.alerts.push({ prompt })
    this.alertsCount = this.alerts.length
  }
  @action error = (a: ErrorRnAlert) => {
    // Log error to save it to the debug log
    // Convert error message to string if it was constructed using intlDebug
    const err = a.unexpectedErr || a.err
    const en = a.message?.en
    if (err) {
      console.error(...(en ? [en, err] : [err]))
    }
    this.alerts.push({
      error: {
        ...a,
        message: a.message?.label,
      },
    })
    this.alertsCount = this.alerts.length
  }
  @action dismiss = () => {
    this.alerts.shift()
    this.alertsCount = this.alerts.length
  }
}

export default new RnAlertStore()
