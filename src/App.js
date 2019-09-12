import './polyfill';

import { StyleProvider } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { Route, Router, Switch } from 'react-router';

import AppOld from './-/AppOld';
import nativeBaseTheme from './-/nativeBaseTheme';
import { history } from './-/routerStore';
import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';
import g from './global';
import registerOnUnhandledError from './native/registerOnUnhandledError';
import Page404 from './shared/Page404';
import RootAlerts from './shared/RootAlerts';

registerOnUnhandledError(unexpectedErr => {
  g.showError({ unexpectedErr });
  return false;
});

class App extends React.Component {
  componentDidMount() {
    if (Platform.OS !== 'web') {
      SplashScreen.hide();
    }
  }
  render() {
    return (
      <Router history={history}>
        <StyleProvider style={nativeBaseTheme}>
          <Switch>
            <Route exact path="/" component={PageProfileSignIn} />
            <Route path="/create-profile" component={PageProfileCreate} />
            <Route path="/update-profile/:id" component={PageProfileUpdate} />
            <Route path="/auth" component={AppOld} />
            <Route component={Page404} />
          </Switch>
        </StyleProvider>
        <RootAlerts />
      </Router>
    );
  }
}

export default App;
