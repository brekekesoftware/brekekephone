import { createHashHistory, createMemoryHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Platform } from 'react-native';

import g from './_';

const r = new RouterStore();
const h = Platform.OS === 'web' ? createHashHistory() : createMemoryHistory();
syncHistoryWithStore(h, r);

// https://stackoverflow.com/a/24056766
let goBackTimeoutId = 0;
const goBack = fn => {
  const l = r.location;
  const h1 = l.pathname + l.search + l.hash;
  h.goBack();
  if (goBackTimeoutId) {
    clearTimeout(goBackTimeoutId);
  }
  goBackTimeoutId = setTimeout(() => {
    goBackTimeoutId = 0;
    const h2 = l.pathname + l.search + l.hash;
    return h1 === h2 && fn();
  }, 100);
};

Object.assign(g, {
  router: r,
  goToProfileSignIn: () => h.push(`/`),
  goToProfileCreate: () => h.push(`/create-profile`),
  goToProfileUpdate: id => h.push(`/update-profile/${id}`),
});
Object.entries(g).forEach(([k, v]) => {
  if (/^goTo/.test(k)) {
    // Add backTo for all goTo helpers
    g[k.replace(/^go/, 'back')] = () => goBack(v);
  }
});
