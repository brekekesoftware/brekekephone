import './polyfill';
import './utils/validator';

import React, { useEffect } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SplashScreen from 'react-native-splash-screen';

import ApiProvider from './-/components/ApiProvider';
import ChatDetail from './-chat/ChatDetail';
import ChatGroupDetail from './-chat/ChatGroupDetail';
import ChatsHome from './-chat/ChatsHome';
import CreateGroup from './-chat/CreateGroup';
import GroupChatInvite from './-chat/GroupChatInvite';
import PageContact from './-contact/PageContact';
import PageIncoming from './-incoming/PageIncoming';
import CallPark from './-phone/CallPark';
import PagePhone from './-phone/PagePhone';
import PageContactPhoneBook from './-phonebook/PageContactPhoneBook';
import PagePhoneBook from './-phonebook/PagePhoneBook';
import PagePhoneBookCreate from './-phonebook/PagePhoneBookCreate';
import PageContactUpdate from './-phonebook/PagePhoneBookUpdate';
import PageProfileCreate from './-profile/PageProfileCreate';
import PageProfileCurrent from './-profile/PageProfileCurrent';
import PageProfileSignIn from './-profile/PageProfileSignIn';
import PageProfileUpdate from './-profile/PageProfileUpdate';
import PageRecent from './-recent/PageRecent';
import Setting from './-settings/Setting';
import TransferAttend from './-transfer/TransferAttend';
import TransferDial from './-transfer/TransferDial';
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
  PageProfileCurrent,
  UsersBrowse: PageContact,
  CallsCreate: PagePhone,
  CallsManage: PageIncoming,
  CallsRecent: PageRecent,
  PhonebooksBrowse: PagePhoneBook,
  ChatsRecent: ChatsHome,
  BuddyChatsRecent: ChatDetail,
  CallKeypad: PagePhone,
  CallPark,
  ContactsBrowse: PageContactPhoneBook,
  Setting: Setting,
});
g.registerStacks({
  PageProfileCreate,
  PageProfileUpdate,
  ChatGroupsCreate: CreateGroup,
  ContactsCreate: PagePhoneBookCreate,
  ContactsUpdate: PageContactUpdate,
  CallTransferAttend: TransferAttend,
  CallTransferDial: TransferDial,
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
