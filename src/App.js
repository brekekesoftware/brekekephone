import './polyfill';

import { configure } from 'mobx';
import React from 'react';
import { AppState, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { Route, Router, Switch } from 'react-router';

import AppOld from './-/AppOld';
import authStore from './-/authStore';
import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';
import g from './global';
import PushNotification from './native/PushNotification';
import registerOnUnhandledError from './native/registerOnUnhandledError';
import Page404 from './shared/Page404';
import RootAlerts from './shared/RootAlerts';

registerOnUnhandledError(unexpectedErr => {
  g.showError({ unexpectedErr });
  return false;
});
configure({ enforceActions: 'always' });

// TODO g.showPrompt then register
// [Violation] Only request notification permission in response to a user gesture
PushNotification.register(n => {
  // TODO handle this better (ask user to switch between accounts)
  if (authStore.profile && AppState.currentState === 'active') {
    return false;
  }
  authStore.signinByNotification(n);
  return true;
});

class App extends React.Component {
  componentDidMount() {
    if (Platform.OS !== 'web') {
      SplashScreen.hide();
    }
  }
  render() {
    return (
      <Router history={g.router.history}>
        <Switch>
          <Route exact path="/" component={PageProfileSignIn} />
          <Route path="/create-profile" component={PageProfileCreate} />
          <Route path="/update-profile/:id" component={PageProfileUpdate} />
          <Route path="/auth" component={AppOld} />
          <Route component={Page404} />
        </Switch>
        <RootAlerts />
      </Router>
    );
  }
}

export default App;
