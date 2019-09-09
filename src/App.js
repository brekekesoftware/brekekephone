import './shared/polyfill';

import { StyleProvider } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { Route, Router, Switch } from 'react-router';

import AppOld from './-/AppOld';
import PageCreateProfile from './PageCreateProfile/PageCreateProfile';
import PageSignIn from './PageSignin/PageSignIn';
import PageUpdateProfile from './PageUpdateProfile/PageUpdateProfile';
import nativeBaseTheme from './shared/nativeBaseTheme';
import { history } from './shared/routerStore';

class App extends React.Component {
  componentDidMount() {
    if (Platform.OS !== 'web') {
      SplashScreen.hide();
    }
  }
  render() {
    return (
      <StyleProvider style={nativeBaseTheme}>
        <Router history={history}>
          <Switch>
            <Route exact path="/" component={PageSignIn} />
            <Route path="/create-profile" component={PageCreateProfile} />
            <Route path="/update-profile/:id" component={PageUpdateProfile} />
            <Route component={AppOld} />
          </Switch>
        </Router>
      </StyleProvider>
    );
  }
}

export default App;
