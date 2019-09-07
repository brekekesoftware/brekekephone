import './shared/polyfill';

import { StyleProvider } from 'native-base';
import React from 'react';
import { Route, Router, Switch } from 'react-router';

import AppOld from './-/AppOld';
import { history } from './mobx/routerStore';
import PageSignIn from './PageSignin/PageSignIn';
import nativeBaseTheme from './shared/nativeBaseTheme';

const App = () => (
  <StyleProvider style={nativeBaseTheme}>
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={PageSignIn} />
        <Route component={AppOld} />
      </Switch>
    </Router>
  </StyleProvider>
);

export default App;
