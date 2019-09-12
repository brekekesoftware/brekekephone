import './nbTheme_';

import { StyleProvider } from 'native-base';
import React from 'react';
import * as Rn from 'react-native';

import ApiProvider from './apis';
import nativeBaseTheme from './nbTheme';
import Routes from './Routes';

// polyfill for native-base
Rn.TouchableNativeFeedback.Ripple = color => color;

const App = () => (
  <StyleProvider style={nativeBaseTheme}>
    <ApiProvider>
      <Routes />
    </ApiProvider>
  </StyleProvider>
);

export default App;
