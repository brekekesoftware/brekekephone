import './polyfill';
import './utils/validator';
import './-/AppOld';

// import { configure } from 'mobx';
import React, { useEffect } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SplashScreen from 'react-native-splash-screen';

import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileCurrent from './-profile/PageProfileCurrent';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';
import g from './global';
import registerOnUnhandledError from './native/registerOnUnhandledError';
import { Platform, StyleSheet, View } from './native/Rn';
import RootAlert from './shared/RootAlert';
import RootPicker from './shared/RootPicker';
import RootStacks from './shared/RootStacks';

registerOnUnhandledError(unexpectedErr => {
  g.showError({ unexpectedErr });
  return false;
});
// configure({ enforceActions: `always` });

g.registerStacks({
  isRoot: true,
  PageProfileSignIn,
});
g.registerStacks({
  PageProfileCreate,
  PageProfileUpdate,
  PageProfileCurrent,
});

const s = StyleSheet.create({
  App: {
    backgroundColor: g.bg,
  },
  App_Inner: {
    flex: 1,
  },
});

const App = () => {
  useEffect(() => {
    if (Platform.OS !== `web`) {
      SplashScreen.hide();
    }
    g.loadProfilesFromLocalStorage();
    g.goToPageProfileSignIn();
  }, []);
  return (
    <View style={[StyleSheet.absoluteFill, s.App]}>
      <View style={s.App_Inner}>
        <RootStacks />
        <RootPicker />
        <RootAlert />
      </View>
      {Platform.OS === `ios` && <KeyboardSpacer />}
    </View>
  );
};

export default App;
