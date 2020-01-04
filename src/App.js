import './polyfill';
import './utils/validator';

import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SplashScreen from 'react-native-splash-screen';

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
import ApiProvider from './api/ApiProvider';
import g from './global';
import authStore from './global/authStore';
import PushNotification from './native/PushNotification';
import registerOnUnhandledError from './native/registerOnUnhandledError';
import { Platform, StatusBar, StyleSheet, Text, View } from './native/Rn';
import AnimatedSize from './shared/AnimatedSize';
import RootAlert from './shared/RootAlert';
import RootAuth from './shared/RootAuth';
import RootPicker from './shared/RootPicker';
import RootStacks from './shared/RootStacks';

registerOnUnhandledError(unexpectedErr => {
  g.showError({ unexpectedErr });
  return false;
});

PushNotification.register();

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

const css = StyleSheet.create({
  App: {
    backgroundColor: g.bg,
  },
  App_Inner: {
    flex: 1,
  },
  App_ConnectionStatus: {
    backgroundColor: g.colors.warning,
  },
  App_ConnectionStatus__failure: {
    backgroundColor: g.colors.danger,
  },
  App_ConnectionStatusInner: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});

const App = observer(() => {
  useEffect(() => {
    if (Platform.OS !== `web`) {
      SplashScreen.hide();
    }
    g.loadProfilesFromLocalStorage();
    g.goToPageProfileSignIn();
    authStore.handleUrlParams();
  }, []);

  const {
    isConnFailure,
    pbxConnectingOrFailure,
    shouldShowConnStatus,
    sipConnectingOrFailure,
    ucConnectingOrFailure,
    ucLoginFromAnotherPlace,
  } = authStore;
  let service = ``;
  if (pbxConnectingOrFailure) {
    service = `PBX`;
  } else if (sipConnectingOrFailure) {
    service = `SIP`;
  } else if (ucConnectingOrFailure) {
    service = `UC`;
  }
  let connMessage =
    service &&
    (isConnFailure
      ? `${service} connection failed`
      : `Connecting to ${service}`);
  if (isConnFailure && ucConnectingOrFailure && ucLoginFromAnotherPlace) {
    connMessage = `UC signed in from another location`;
  }

  return (
    <View style={[StyleSheet.absoluteFill, css.App]}>
      <StatusBar />
      {shouldShowConnStatus && (
        <AnimatedSize
          style={[
            css.App_ConnectionStatus,
            isConnFailure && css.App_ConnectionStatus__failure,
          ]}
        >
          <View style={css.App_ConnectionStatusInner}>
            <Text small white>
              {connMessage}
            </Text>
          </View>
        </AnimatedSize>
      )}
      <View style={css.App_Inner}>
        <ApiProvider />
        <RootStacks />
        <RootPicker />
        <RootAlert />
        <RootAuth />
      </View>
      {Platform.OS === `ios` && <KeyboardSpacer />}
    </View>
  );
});

export default App;
