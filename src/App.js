import './polyfill';

import { configure } from 'mobx';
import React from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SplashScreen from 'react-native-splash-screen';
import { Route, Router } from 'react-router';
import Stack from 'react-router-native-stack';

import AppOld from './-/AppOld';
import authStore from './-/authStore';
import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';
import g from './global';
import PushNotification from './native/PushNotification';
import registerOnUnhandledError from './native/registerOnUnhandledError';
import { AppState, Platform, StyleSheet, View } from './native/Rn';
import Page404 from './shared/Page404';
import RootAlerts from './shared/RootAlerts';
import v from './variables';

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

const s = StyleSheet.create({
  App: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: v.bg,
  },
  App_Inner: {
    flex: 1,
  },
});

class App extends React.Component {
  componentDidMount() {
    if (Platform.OS !== 'web') {
      SplashScreen.hide();
    }
  }
  render() {
    return (
      <View style={s.App}>
        <View style={s.App_Inner}>
          <Router history={g.router.history}>
            <Stack isAnimating={v => (g.isRouterAnimating = v)}>
              <Route exact path="/" component={PageProfileSignIn} />
              <Route path="/create-profile" component={PageProfileCreate} />
              <Route path="/update-profile/:id" component={PageProfileUpdate} />
              <Route path="/auth" component={AppOld} />
              <Route component={Page404} />
            </Stack>
          </Router>
          <RootAlerts />
        </View>
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </View>
    );
  }
}

export default App;
