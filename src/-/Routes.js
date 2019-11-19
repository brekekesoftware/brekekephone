import qs from 'qs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, Route } from 'react-router';

import ChatDetail from '../-chat/ChatDetail';
import ChatGroupDetail from '../-chat/ChatGroupDetail';
import ChatsHome from '../-chat/ChatsHome';
import CreateGroup from '../-chat/CreateGroup';
import GroupChatInvite from '../-chat/GroupChatInvite';
import PageContact from '../-contact/PageContact';
import Callbar from '../-incoming/CallBar';
import PageIncoming from '../-incoming/PageIncoming';
import CallNotify from '../-notify/CallNotify';
import ChatGroupInvite from '../-notify/ChatGroupInvite';
import CallPark from '../-phone/CallPark';
import PagePhone from '../-phone/PagePhone';
import PageContactPhoneBook from '../-phonebook/PageContactPhoneBook';
import PagePhoneBook from '../-phonebook/PagePhoneBook';
import PagePhoneBookCreate from '../-phonebook/PagePhoneBookCreate';
import PageContactUpdate from '../-phonebook/PagePhoneBookUpdate';
import Recent from '../-recent/PageRecent';
import TransferAttend from '../-transfer/TransferAttend';
import TransferDial from '../-transfer/TransferDial';
import g from '../global';
import FooterTab from '../shared/FooterTab';
import AuthContainer from './components/AuthContainer';
import AuthPBX from './components/AuthPBX';
import AuthSIP from './components/AuthSIP';
import AuthUC from './components/AuthUC';
import CallVideos from './components/CallVideos';
import CallVoices from './components/CallVoices';
import WithoutStatusBar from './components/WithoutStatusBar';
import router from './routerStore';

// Wait and push history to fix some strange issues with router
const withTimeout = fn => (...args) => setTimeout(() => fn(...args), 17);

Object.assign(g, {
  getQuery: () => qs.parse(router.location.search.replace(/^\?*/, ``)),
});
Object.assign(router, {
  goToAuth: withTimeout(() => router.history.push(`/`)),
  goToBuddyChatsRecent: withTimeout(buddy =>
    router.history.push(`/chats/buddy/${buddy}/recent`),
  ),
  goToCallKeypad: withTimeout(call =>
    router.history.push(`/call/${call}/keypad`),
  ),
  goToCallPark: withTimeout(screen =>
    router.history.push(`/call/${screen}/park`),
  ),
  goToCallsCreate: withTimeout(() => router.history.push(`/calls/create`)),
  goToCallsManage: withTimeout(() => router.history.push(`/calls/manage`)),
  goToCallsRecent: withTimeout(() => router.history.push(`/calls/recent`)),
  goToCallTransferAttend: withTimeout(call =>
    router.history.push(`/call/${call}/transfer/attend`),
  ),
  goToCallTransferDial: withTimeout(call =>
    router.history.push(`/call/${call}/transfer/dial`),
  ),
  goToChatGroupInvite: withTimeout(group =>
    router.history.push(`/chat-group/${group}/invite`),
  ),
  goToChatGroupsCreate: withTimeout(() =>
    router.history.push(`/chat-groups/create`),
  ),
  goToChatGroupsRecent: withTimeout(group =>
    router.history.push(`/chats/group/${group}/recent`),
  ),
  goToChatsRecent: withTimeout(() => router.history.push(`/chats/recent`)),
  goToContactsBrowse: withTimeout(query =>
    router.history.push(`/contacts/browse?${qs.stringify(query)}`),
  ),
  goToContactsCreate: withTimeout(query =>
    router.history.push(`/contacts/create?${qs.stringify(query)}`),
  ),
  goToContactsUpdate: withTimeout(query =>
    router.history.push(`/contacts/update?${qs.stringify(query)}`),
  ),
  goToPhonebooksBrowse: withTimeout(() =>
    router.history.push(`/phonebooks/browse`),
  ),
  goToUsersBrowse: withTimeout(() => router.history.push(`/users`)),
});

const Routes = () => (
  <View style={StyleSheet.absoluteFill}>
    <WithoutStatusBar>
      <Route
        path="/"
        render={() => (
          <AuthContainer>
            <Route component={Callbar} path="/" />
            <Route exact path="/" render={() => <Redirect to="/users" />} />
            <Route component={PageIncoming} exact path="/calls/manage" />
            <Route component={PagePhone} exact path="/calls/create" />
            <Route component={Recent} exact path="/calls/recent" />
            <Route
              component={TransferDial}
              exact
              path="/call/:call/transfer/dial"
            />
            <Route
              component={TransferAttend}
              exact
              path="/call/:call/transfer/attend"
            />
            <Route component={PagePhone} exact path="/call/:call/keypad" />
            <Route component={CallPark} exact path="/call/:screen/park" />
            <Route component={PageContact} exact path="/users" />
            <Route
              component={ChatDetail}
              exact
              path="/chats/buddy/:buddy/recent"
            />
            <Route
              component={ChatGroupDetail}
              exact
              path="/chats/group/:group/recent"
            />
            <Route component={CreateGroup} exact path="/chat-groups/create" />
            <Route
              component={GroupChatInvite}
              exact
              path="/chat-group/:group/invite"
            />
            <Route component={ChatsHome} exact path="/chats/recent" />
            <Route component={PagePhoneBook} exact path="/phonebooks/browse" />
            <Route
              component={PageContactPhoneBook}
              exact
              path="/contacts/browse"
            />
            <Route
              component={PagePhoneBookCreate}
              exact
              path="/contacts/create"
            />
            <Route
              component={PageContactUpdate}
              exact
              path="/contacts/update"
            />
          </AuthContainer>
        )}
      />
      <Route component={AuthPBX} path="/" />
      <Route component={AuthSIP} path="/" />
      <Route component={AuthUC} path="/" />
      <Route component={CallVoices} path="/" />
      <Route component={CallVideos} path="/" />
      <Route component={FooterTab} path="/" />
      <Route component={CallNotify} path="/" />
      <Route component={ChatGroupInvite} path="/" />
    </WithoutStatusBar>
  </View>
);

export default Routes;
