import './polyfill';
import './utils/validator';

import React, { useEffect } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SplashScreen from 'react-native-splash-screen';

import ApiProvider from './-/components/ApiProvider';
import PageIncoming from './-call/PageIncoming';
import PagePhoneKeypad from './-call/PagePhoneKeypad';
import PagePhoneParks from './-call/PagePhoneParks';
import PagePhoneRecents from './-call/PagePhoneRecents';
import PageTransferAttend from './-call/PageTransferAttend';
import PageTransferDial from './-call/PageTransferDial';
import ChatGroupDetail from './-chat/ChatGroupDetail';
import ChatsHome from './-chat/ChatsHome';
import CreateGroup from './-chat/CreateGroup';
import GroupChatInvite from './-chat/GroupChatInvite';
import PageChatDetail from './-chat/PageChatDetail';
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
  PageSettingsProfile,
  PageContactUsers,
  PagePhoneRecents,
  CallsManage: PageIncoming,
  ChatsRecent: ChatsHome,
  PagePhoneKeypad,
  PagePhoneParks,
  PageContactPhonebook,
  PageSettingsOther,
});
g.registerStacks({
  PageProfileCreate,
  PageProfileUpdate,
  PageChatDetail,
  PagePhonebookCreate,
  PagePhonebookUpdate,
  PageTransferAttend,
  PageTransferDial,
  ChatGroupsCreate: CreateGroup,
  ChatGroupInvite: GroupChatInvite,
  ChatGroupsRecent: ChatGroupDetail,
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
