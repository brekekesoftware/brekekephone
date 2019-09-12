import { createHashHistory, createMemoryHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Platform } from 'react-native';

import g from './_';

const r = new RouterStore();
syncHistoryWithStore(
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory(),
  r,
);

// https://stackoverflow.com/a/24056766
let goBackTimeoutId = 0;
const goBack = fn => {
  const h1 = r.location.pathname + r.location.search + r.location.hash;
  r.history.goBack();
  if (goBackTimeoutId) {
    clearTimeout(goBackTimeoutId);
  }
  goBackTimeoutId = setTimeout(() => {
    goBackTimeoutId = 0;
    const h2 = r.location.pathname + r.location.search + r.location.hash;
    return h1 === h2 && fn();
  }, 100);
};

Object.assign(g, {
  router: r,
  goToProfileSignIn: () => r.history.push(`/`),
  goToProfileCreate: () => r.history.push(`/create-profile`),
  goToProfileUpdate: id => r.history.push(`/update-profile/${id}`),
});
Object.entries(g).forEach(([k, v]) => {
  if (/^goTo/.test(k)) {
    // Add backTo for all goTo helpers
    g[k.replace(/^go/, 'back')] = () => goBack(v);
  }
});
