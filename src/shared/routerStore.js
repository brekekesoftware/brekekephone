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

// Add router navigation helper
Object.assign(routerStore, {
  goToPageSignIn: withTimeout(() => history.push('/')),
});

export { history };
export default routerStore;
