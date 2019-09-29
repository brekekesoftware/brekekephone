import './nbTheme_';

import { StyleProvider } from 'native-base';
import React from 'react';
import * as Rn from 'react-native';
import { Router } from 'react-router';

import ApiProvider from './apis';
import { setAppOld } from './AppOld_';
import nativeBaseTheme from './nbTheme';
import router from './routerStore';
import Routes from './Routes';

if (Rn.Platform.OS === `web`) {
  // polyfill for native-base
  Rn.TouchableNativeFeedback.Ripple = color => color;
}

const App = () => (
  <Router history={router.history}>
    <StyleProvider style={nativeBaseTheme}>
      <ApiProvider>
        <Routes />
      </ApiProvider>
    </StyleProvider>
  </Router>
);
setAppOld(App);

export default App;
