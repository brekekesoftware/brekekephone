import qs from 'qs';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, Route } from 'react-router';

import PageContact from '../-contact/PageContact';
import PageSetting from '../-setting/PageSetting';
import g from '../global';
import Auth from './auth';
import WithoutStatusBar from './auth/WithoutStatusBar';
import BuddyChatsNotify from './buddy-chats-notify';
import BuddyChatsRecent from './buddy-chats-recent';
import CallKeypad from './call-keypad';
import CallPark from './call-park';
import CallTransferAttend from './call-transfer-attend';
import CallTransferDial from './call-transfer-dial';
import CallVideos from './call-videos';
import CallVoices from './call-voices';
import Callbar from './callbar';
import CallsCreate from './calls-create';
import CallsManage from './calls-manage';
import CallsNotify from './calls-notify';
import CallsRecent from './calls-recent';
import ChatGroupInvite from './chat-group-invite';
import ChatGroupsCreate from './chat-groups-create';
import ChatGroupsNotify from './chat-groups-notify';
import ChatsRecent from './chats-recent';
import ContactsBrowse from './contacts-browse';
import ContactsCreate from './contacts-create';
import GroupChatsRecent from './group-chats-recent';
import Notifications from './notifications';
import PBXAuth from './pbx-auth';
import PhonebooksBrowse from './phonebooks-browse';
import SIPAuth from './sip-auth';
import Tabbar from './tabbar';
import UCAuth from './uc-auth';

// Wait and push history to fix some strange issues with router
const withTimeout = fn => (...args) => setTimeout(() => fn(...args), 17);

Object.assign(g, {
  getQuery: () => qs.parse(g.router.location.search.replace(/^\?*/, '')),
  goToAuth: withTimeout(() => g.router.history.push('/auth')),
  goToBuddyChatsRecent: withTimeout(buddy =>
    g.router.history.push(`/auth/chats/buddy/${buddy}/recent`),
  ),
  goToCallKeypad: withTimeout(call =>
    g.router.history.push(`/auth/call/${call}/keypad`),
  ),
  goToCallPark: withTimeout(call =>
    g.router.history.push(`/auth/call/${call}/park`),
  ),
  goToCallsCreate: withTimeout(() =>
    g.router.history.push('/auth/calls/create'),
  ),
  goToCallsManage: withTimeout(() =>
    g.router.history.push('/auth/calls/manage'),
  ),
  goToCallsRecent: withTimeout(() =>
    g.router.history.push('/auth/calls/recent'),
  ),
  goToCallTransferAttend: withTimeout(call =>
    g.router.history.push(`/auth/call/${call}/transfer/attend`),
  ),
  goToCallTransferDial: withTimeout(call =>
    g.router.history.push(`/auth/call/${call}/transfer/dial`),
  ),
  goToChatGroupInvite: withTimeout(group =>
    g.router.history.push(`/auth/chat-group/${group}/invite`),
  ),
  goToChatGroupsCreate: withTimeout(() =>
    g.router.history.push('/auth/chat-groups/create'),
  ),
  goToChatGroupsRecent: withTimeout(group =>
    g.router.history.push(`/auth/chats/group/${group}/recent`),
  ),
  goToChatsRecent: withTimeout(() =>
    g.router.history.push('/auth/chats/recent'),
  ),
  goToContactsBrowse: withTimeout(query =>
    g.router.history.push(`/auth/contacts/browse?${qs.stringify(query)}`),
  ),
  goToContactsCreate: withTimeout(query =>
    g.router.history.push(`/auth/contacts/create?${qs.stringify(query)}`),
  ),
  goToPhonebooksBrowse: withTimeout(() =>
    g.router.history.push('/auth/phonebooks/browse'),
  ),
  goToProfileSignin: withTimeout(profile =>
    g.router.history.push(`/profile/${profile}/signin`),
  ),
  goToSettings: withTimeout(() => g.router.history.push('/auth/settings')),
  goToUsersBrowse: withTimeout(() => g.router.history.push('/auth/users')),
});

const Routes = () => (
  <View style={StyleSheet.absoluteFill}>
    <WithoutStatusBar>
      <Route
        path="/auth"
        render={() => (
          <Auth>
            <Route path="/auth" component={Callbar} />
            <Route
              exact
              path="/auth"
              render={() => <Redirect to="/auth/users" />}
            />
            <Route exact path="/auth/calls/manage" component={CallsManage} />
            <Route exact path="/auth/calls/create" component={CallsCreate} />
            <Route exact path="/auth/calls/recent" component={CallsRecent} />
            <Route
              exact
              path="/auth/call/:call/transfer/dial"
              component={CallTransferDial}
            />
            <Route
              exact
              path="/auth/call/:call/transfer/attend"
              component={CallTransferAttend}
            />
            <Route
              exact
              path="/auth/call/:call/keypad"
              component={CallKeypad}
            />
            <Route exact path="/auth/call/:call/park" component={CallPark} />
            <Route exact path="/auth/users" component={PageContact} />
            <Route
              exact
              path="/auth/chats/buddy/:buddy/recent"
              component={BuddyChatsRecent}
            />
            <Route
              exact
              path="/auth/chats/group/:group/recent"
              component={GroupChatsRecent}
            />
            <Route
              exact
              path="/auth/chat-groups/create"
              component={ChatGroupsCreate}
            />
            <Route
              exact
              path="/auth/chat-group/:group/invite"
              component={ChatGroupInvite}
            />
            <Route exact path="/auth/chats/recent" component={ChatsRecent} />
            <Route exact path="/auth/settings" component={PageSetting} />
            <Route
              exact
              path="/auth/phonebooks/browse"
              component={PhonebooksBrowse}
            />
            <Route
              exact
              path="/auth/contacts/browse"
              component={ContactsBrowse}
            />
            <Route
              exact
              path="/auth/contacts/create"
              component={ContactsCreate}
            />
          </Auth>
        )}
      />
      <Route path="/auth" component={PBXAuth} />
      <Route path="/auth" component={SIPAuth} />
      <Route path="/auth" component={UCAuth} />
      <Route path="/auth" component={CallVoices} />
      <Route path="/auth" component={CallVideos} />
      <Route path="/auth" component={Tabbar} />
    </WithoutStatusBar>
    <Notifications>
      <Route path="/auth" component={CallsNotify} />
      <Route path="/auth" component={ChatGroupsNotify} />
      <Route path="/auth" component={BuddyChatsNotify} />
    </Notifications>
  </View>
);

export default Routes;
