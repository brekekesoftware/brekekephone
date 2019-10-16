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
import PageCalling from '../-incoming/PageCalling';
import PagePhone from '../-phone/PagePhone';
import Recent from '../-recent/PageRecent';
import TransferAttend from '../-transfer/TransferAttend';
import TransferDial from '../-transfer/TransferDial';
import g from '../global';
import Auth from './auth';
import WithoutStatusBar from './auth/WithoutStatusBar';
import BuddyChatsNotify from './buddy-chats-notify';
import CallKeypad from './call-keypad';
import CallPark from './call-park';
import CallVideos from './call-videos';
import CallVoices from './call-voices';
import Callbar from './callbar';
import CallsNotify from './calls-notify';
import ChatGroupsNotify from './chat-groups-notify';
import ContactsBrowse from './contacts-browse';
import ContactsCreate from './contacts-create';
import Notifications from './notifications';
import PBXAuth from './pbx-auth';
import PhonebooksBrowse from './phonebooks-browse';
import router from './routerStore';
import SIPAuth from './sip-auth';
import Tabbar from './tabbar';
import UCAuth from './uc-auth';

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
  goToCallPark: withTimeout(call => router.history.push(`/call/${call}/park`)),
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
          <Auth>
            <Route path="/" component={Callbar} />
            <Route exact path="/" render={() => <Redirect to="/users" />} />
            <Route exact path="/calls/manage" component={PageCalling} />
            <Route exact path="/calls/create" component={PagePhone} />
            <Route exact path="/calls/recent" component={Recent} />
            <Route
              exact
              path="/call/:call/transfer/dial"
              component={TransferDial}
            />
            <Route
              exact
              path="/call/:call/transfer/attend"
              component={TransferAttend}
            />
            <Route exact path="/call/:call/keypad" component={CallKeypad} />
            <Route exact path="/call/:call/park" component={CallPark} />
            <Route exact path="/users" component={PageContact} />
            <Route
              exact
              path="/chats/buddy/:buddy/recent"
              component={ChatDetail}
            />
            <Route
              exact
              path="/chats/group/:group/recent"
              component={ChatGroupDetail}
            />
            <Route exact path="/chat-groups/create" component={CreateGroup} />
            <Route
              exact
              path="/chat-group/:group/invite"
              component={GroupChatInvite}
            />
            <Route exact path="/chats/recent" component={ChatsHome} />
            <Route
              exact
              path="/phonebooks/browse"
              component={PhonebooksBrowse}
            />
            <Route exact path="/contacts/browse" component={ContactsBrowse} />
            <Route exact path="/contacts/create" component={ContactsCreate} />
          </Auth>
        )}
      />
      <Route path="/" component={PBXAuth} />
      <Route path="/" component={SIPAuth} />
      <Route path="/" component={UCAuth} />
      <Route path="/" component={CallVoices} />
      <Route path="/" component={CallVideos} />
      <Route path="/" component={Tabbar} />
    </WithoutStatusBar>
    <Notifications>
      <Route path="/" component={CallsNotify} />
      <Route path="/" component={ChatGroupsNotify} />
      <Route path="/" component={BuddyChatsNotify} />
    </Notifications>
  </View>
);

export default Routes;
