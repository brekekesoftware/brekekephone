import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, Route } from 'react-router';

import Auth from './modules/auth';
import WithoutStatusBar from './modules/auth/WithoutStatusBar';
import BuddyChatsNotify from './modules/buddy-chats-notify';
import BuddyChatsRecent from './modules/buddy-chats-recent';
import CallKeypad from './modules/call-keypad';
import CallPark from './modules/call-park';
import CallTransferAttend from './modules/call-transfer-attend';
import CallTransferDial from './modules/call-transfer-dial';
import CallVideos from './modules/call-videos';
import CallVoices from './modules/call-voices';
import Callbar from './modules/callbar';
import CallsCreate from './modules/calls-create';
import CallsManage from './modules/calls-manage';
import CallsNotify from './modules/calls-notify';
import CallsRecent from './modules/calls-recent';
import ChatGroupInvite from './modules/chat-group-invite';
import ChatGroupsCreate from './modules/chat-groups-create';
import ChatGroupsNotify from './modules/chat-groups-notify';
import ChatsRecent from './modules/chats-recent';
import ContactsBrowse from './modules/contacts-browse';
import ContactsCreate from './modules/contacts-create';
import GroupChatsRecent from './modules/group-chats-recent';
import Notifications from './modules/notifications';
import PBXAuth from './modules/pbx-auth';
import PhonebooksBrowse from './modules/phonebooks-browse';
import ProfileSignin from './modules/profile-signin';
import ProfileUpdate from './modules/profile-update';
import ProfilesCreate from './modules/profiles-create';
import ProfilesManage from './modules/profiles-manage';
import Settings from './modules/settings';
import SIPAuth from './modules/sip-auth';
import StatusBar from './modules/statusbar';
import Tabbar from './modules/tabbar';
import ToastsNotify from './modules/toasts-notify';
import UCAuth from './modules/uc-auth';
import UsersBrowse from './modules/users-browse';
import PageServers from './component-Signin/PageServers';
import HomePage from './components-Home/HomePage';

const Routes = () => (
  <View style={StyleSheet.absoluteFill}>
    <StatusBar />
    <WithoutStatusBar>
      <Route exact path="/" render={() => <Redirect to="/profiles/manage" />} />
      <Route exact path="/profiles/manage" component={HomePage} />
      <Route exact path="/profiles/create" component={ProfilesCreate} />
      <Route exact path="/profile/:profile/update" component={ProfileUpdate} />
      <Route exact path="/profile/:profile/signin" component={ProfileSignin} />
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
            <Route exact path="/auth/users" component={UsersBrowse} />
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
            <Route exact path="/auth/settings" component={Settings} />
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
      <ToastsNotify />
    </Notifications>
  </View>
);

export default Routes;
