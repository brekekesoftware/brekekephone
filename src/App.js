import './polyfill';
import './utils/validator';

import React, { useEffect } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SplashScreen from 'react-native-splash-screen';

import ApiProvider from './-/components/ApiProvider';
import PageCallKeypad from './-call/PageCallKeypad';
import PageCallManage from './-call/PageCallManage';
import PageCallParks from './-call/PageCallParks';
import PageCallRecents from './-call/PageCallRecents';
import PageTransferAttend from './-call/PageTransferAttend';
import PageTransferDial from './-call/PageTransferDial';
import PageChatDetail from './-chat/PageChatDetail';
import PageChatGroupCreate from './-chat/PageChatGroupCreate';
import PageChatGroupDetail from './-chat/PageChatGroupDetail';
import PageChatGroupInvite from './-chat/PageChatGroupInvite';
import PageChatRecents from './-chat/PageChatRecents';
import PageContactPhonebook from './-contact/PageContactPhonebook';
import PageContactUsers from './-contact/PageContactUsers';
import PagePhonebookCreate from './-contact/PagePhonebookCreate';
import PagePhonebookUpdate from './-contact/PagePhonebookUpdate';
import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';
import PageSettingsOther from './-settings/PageSettingsOther';
import PageSettingsProfile from './-settings/PageSettingsProfile';
import g from './global';
import registerOnUnhandledError from './native/registerOnUnhandledError';
import { Platform, StyleSheet, View } from './native/Rn';
import RootAlert from './shared/RootAlert';
import RootAuth from './shared/RootAuth';
import RootPicker from './shared/RootPicker';
import RootStacks from './shared/RootStacks';

registerOnUnhandledError(unexpectedErr => {
  g.showError({ unexpectedErr });
  return false;
});

g.registerStacks({
  isRoot: true,
  PageProfileSignIn,
  PageChatRecents,
  PageContactPhonebook,
  PageContactUsers,
  PageCallKeypad,
  PageCallParks,
  PageCallRecents,
  PageSettingsOther,
  PageSettingsProfile,
});
g.registerStacks({
  PageProfileCreate,
  PageProfileUpdate,
  PagePhonebookCreate,
  PagePhonebookUpdate,
  PageCallManage,
  PageChatDetail,
  PageTransferAttend,
  PageTransferDial,
  PageChatGroupCreate,
  PageChatGroupInvite,
  PageChatGroupDetail,
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
        <ApiProvider>
          <RootStacks />
          <RootPicker />
          <RootAlert />
          <RootAuth />
        </ApiProvider>
      </View>
      {Platform.OS === `ios` && <KeyboardSpacer />}
    </View>
  );
};

export default App;
