import './shared/polyfill';

import { StyleProvider } from 'native-base';
import React from 'react';
import { Route, Router } from 'react-router';

import AppOld from './-/AppOld';
import { history } from './mobx/routerStore';
import PageSignin from './PageSignin/PageSignin';
import nativeBaseTheme from './shared/nativeBaseTheme';

const App = () => (
  <StyleProvider style={nativeBaseTheme}>
    <Router history={history}>
      <Route exact path="/" component={PageSignin} />
      <AppOld />
    </Router>
  </StyleProvider>
);

export default App;
