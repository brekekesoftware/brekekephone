import { BackHandler } from '../native/Rn';
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
  // loading?: boolean|
  //    dismissTimeout: boolean|number
  alerts: [],
  showPrompt: prompt => {
    $.alerts.push({ prompt });
    $.set(`alertsCount`, $.alerts.length);
  },
  showError: error => {
    $.alerts.push({ error });
    $.set(`alertsCount`, $.alerts.length);
  },
  showLoading: loading => {
    loading = loading || true;
    $.alerts.push({ loading });
    $.set(`alertsCount`, $.alerts.length);
  },
  dismissAlert: () => {
    $.alerts.shift();
    $.set(`alertsCount`, $.alerts.length);
  },
});

// Handle android hardware back button press
BackHandler.addEventListener(`hardwareBackPress`, () => {
  if ($.alerts.length) {
    $.dismissAlert();
    return true;
  }
  return false;
});
