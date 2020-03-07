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
    $.alerts.push({ prompt });
    $.set(`alertsCount`, $.alerts.length);
  },
  showError: error => {
    $.alerts.push({ error });
    $.set(`alertsCount`, $.alerts.length);
    // Call console.error to save the error to log file
    const err = error.unexpectedErr || error.err;
    if (!err) {
      return;
    }
    const k = error.message?.en || error.message;
    console.error(...(k ? [k, err] : [err]));
  },
  dismissAlert: () => {
    $.alerts.shift();
    $.set(`alertsCount`, $.alerts.length);
  },
});
