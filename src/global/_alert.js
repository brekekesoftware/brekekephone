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
    g.setFn('pendingAlerts', a => a.shift());
  },
  showPrompt: prompt => {
    g.setFn('pendingAlerts', a => a.push({ prompt }));
  },
  showError: error => {
    g.setFn('pendingAlerts', a => a.push({ error }));
  },
  showLoading: loading => {
    loading = loading || true;
    g.setFn('pendingAlerts', a => a.push({ loading }));
  },
});
