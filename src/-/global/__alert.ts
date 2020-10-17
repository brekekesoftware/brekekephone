import $ from './_'

$.extends({
  observable: {
    alertsCount: 0,
  },
  // Need to put `alerts` out of the observable
  //    because ReactElement can not stay in the mobx state
  // prompt?:
  //    title: string|ReactElement
  //    message: string|ReactElement
  //    onConfirm?: Function
  //    onDismiss?: Function
  // error?:
  //    message: string|ReactElement
  //    err: Error
  //    unexpectedErr?: Error
  alerts: [],
  showPrompt: prompt => {
    window.setTimeout(() => {
      $.alerts.push({ prompt })
      $.set('alertsCount', $.alerts.length)
    })
  },
  showError: error => {
    // Log error to save it to the debug log
    // Convert error message to string if it was constructed using intlDebug
    const err = error.unexpectedErr || error.err
    const en = error.message?.en || error.message
    if (err) {
      console.error(...(en ? [en, err] : [err]))
    }
    $.alerts.push({
      error: {
        ...error,
        message: error.message?.label || error.message,
      },
    })
    $.set('alertsCount', $.alerts.length)
  },
  dismissAlert: () => {
    $.alerts.shift()
    $.set('alertsCount', $.alerts.length)
  },
})
