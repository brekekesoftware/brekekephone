import './oldNativeBaseTheme';

import { StyleProvider } from 'native-base';
import React from 'react';
import * as Rn from 'react-native';

import ApiProvider from './apis';
import nativeBaseTheme from './nativeBaseTheme';
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
