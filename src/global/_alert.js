import { extendObservable } from 'mobx';

import g from './_';

// prompt?:
//    title: string
//    message: string
//    onConfirm?: Function
//    onDismiss?: Function
// error?:
//    message: string
//    err: Error
//    unexpectedErr?: Error
// loading?: boolean |
//    dismissTimeout: boolean

extendObservable(g, {
  pendingAlerts: [],
  dismissAlert: () => {
    g.setFn('pendingAlerts', dr => dr.shift());
  },
  showPrompt: prompt => {
    g.setFn('pendingAlerts', dr => dr.push({ prompt }));
  },
  showError: error => {
    g.setFn('pendingAlerts', dr => dr.push({ error }));
  },
  showLoading: loading => {
    loading = loading || true;
    g.setFn('pendingAlerts', dr => dr.push({ loading }));
  },
});
