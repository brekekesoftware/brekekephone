import $ from './_';

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
    setTimeout(() => {
      $.alerts.push({ prompt });
      $.set(`alertsCount`, $.alerts.length);
    });
  },
  showError: error => {
    // Log error to save it to the debug log
    const err = error.unexpectedErr || error.err;
    if (err) {
      const k = error.message?.intl || error.message;
      console.error(...(k ? [k, err] : [err]));
    }
    // Convert error message to string if it was constructed using intl.debug
    if (error.message?.intl) {
      error.message = `${error.message}`;
    }
    $.alerts.push({ error });
    $.set(`alertsCount`, $.alerts.length);
  },
  dismissAlert: () => {
    $.alerts.shift();
    $.set(`alertsCount`, $.alerts.length);
  },
});
