import { createHashHistory, createMemoryHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Platform } from 'react-native';

const routerStore = new RouterStore();
const history = syncHistoryWithStore(
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory(),
  routerStore,
);

// Wait and push history to fix some strange issues with router
const withTimeout = fn => (...args) => setTimeout(() => fn(...args), 17);

// Implement goBack and polyfill for web
let goBackTimeoutId = 0;
const goBack = fn => {
  try {
    const href1 =
      routerStore.location.pathname +
      routerStore.location.search +
      routerStore.location.hash;
    history.goBack();
    if (goBackTimeoutId) {
      clearTimeout(goBackTimeoutId);
    }
    goBackTimeoutId = setTimeout(() => {
      goBackTimeoutId = 0;
      const href2 =
        routerStore.location.pathname +
        routerStore.location.search +
        routerStore.location.hash;
      if (href1 === href2) {
        return fn && fn();
      }
    }, 170);
  } catch (err) {
    if (fn) {
      return fn && fn();
    }
  }
};

// Add router navigation helper
Object.assign(routerStore, {
  goBack,
  goBackFn: fn => () => goBack(fn),
  goToPageProfileSignIn: withTimeout(() => history.push(`/`)),
  goToPageProfileCreate: withTimeout(() => history.push(`/create-profile`)),
  goToPageProfileUpdate: withTimeout(id =>
    history.push(`/update-profile/${id}`),
  ),
});

export { history };
export default routerStore;
