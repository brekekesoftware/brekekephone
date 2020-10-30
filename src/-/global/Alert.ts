import { action, observable } from 'mobx'
import { ReactElement } from 'react'

import { IntlDebug } from '../intl/intl'

type CommonAlertFields = {
  confirmText?: string | boolean
  dismissText?: string | boolean
}

export type PromptAlert = CommonAlertFields & {
  title: string | ReactElement
  message: string | ReactElement
  onConfirm?: Function
  onDismiss?: Function
}
export type ErrorAlert = CommonAlertFields & {
  message?: IntlDebug
  err?: Error
  unexpectedErr?: Error
}
export type ErrorAlert2 = Omit<ErrorAlert, 'message'> & {
  message?: string
}

export type Alert =
  | {
      prompt: PromptAlert
    }
  | {
      error: ErrorAlert2
    }

export class AlertStore {
  // Need to put `alerts` out of the observable
  //  because ReactElement can not stay in the mobx state
  @observable alertsCount = 0
  alerts: Alert[] = []

  @action showPrompt = (prompt: PromptAlert) => {
    this.alerts.push({ prompt })
    this.alertsCount = this.alerts.length
  }
  @action showError = (a: ErrorAlert) => {
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
  dismiss = () => {
    this.alerts.shift()
    this.alertsCount = this.alerts.length
  }
}

export default new AlertStore()
