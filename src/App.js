import './---utils/polyfill';
import './polyfill';

import { StyleProvider } from 'native-base';
import React from 'react';
import { Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { Route, Router, Switch } from 'react-router';

import { history } from './---shared/routerStore';
import nativeBaseTheme from './---style/nativeBaseTheme';
import AppOld from './-/AppOld';
import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';

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
            <Route exact path="/" component={PageProfileSignIn} />
            <Route path="/create-profile" component={PageProfileCreate} />
            <Route path="/update-profile/:id" component={PageProfileUpdate} />
            <Route component={AppOld} />
          </Switch>
        </Router>
      </StyleProvider>
    );
  }
}

export default App;
