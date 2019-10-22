import React from 'react';
import * as Rn from 'react-native';
import { Router } from 'react-router';

import ApiProvider from './apis';
import { setAppOld } from './AppOld_';
import router from './routerStore';
import Routes from './Routes';

if (Rn.Platform.OS === `web`) {
  // polyfill for native-base
  Rn.TouchableNativeFeedback.Ripple = color => color;
}

const App = () => (
  <Router history={router.history}>
    <ApiProvider>
      <Routes />
    </ApiProvider>
  </Router>
);
setAppOld(App);

export default App;
