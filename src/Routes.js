import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, Route } from 'react-router';

import NewCallPark from './components-Setting/NewCallPark';
import Auth from './components/auth';
import WithoutStatusBar from './components/auth/WithoutStatusBar';
import BuddyChatsNotify from './components/buddy-chats-notify';
import BuddyChatsRecent from './components/buddy-chats-recent';
import CallKeypad from './components/call-keypad';
import CallPark from './components/call-park';
import CallTransferAttend from './components/call-transfer-attend';
import CallTransferDial from './components/call-transfer-dial';
import CallVideos from './components/call-videos';
import CallVoices from './components/call-voices';
import Callbar from './components/callbar';
import CallsCreate from './components/calls-create';
import CallsManage from './components/calls-manage';
import CallsNotify from './components/calls-notify';
import CallsRecent from './components/calls-recent';
import ChatGroupInvite from './components/chat-group-invite';
import ChatGroupsCreate from './components/chat-groups-create';
import ChatGroupsNotify from './components/chat-groups-notify';
import ChatsRecent from './components/chats-recent';
import ContactsBrowse from './components/contacts-browse';
import ContactsCreate from './components/contacts-create';
import GroupChatsRecent from './components/group-chats-recent';
import Notifications from './components/notifications';
import PBXAuth from './components/pbx-auth';
import PhonebooksBrowse from './components/phonebooks-browse';
import ProfileSignin from './components/profile-signin';
import ProfileUpdate from './components/profile-update';
import ProfilesCreate from './components/profiles-create';
import Settings from './components/settings';
import SIPAuth from './components/sip-auth';
import StatusBar from './components/statusbar';
import Tabbar from './components/tabbar';
import UCAuth from './components/uc-auth';
import UsersBrowse from './components/users-browse';
import PageSignin from './PageSignin/PageSignin';

const Routes = () => (
  <View style={StyleSheet.absoluteFill}>
    <StatusBar />
    <WithoutStatusBar>
      <Route exact path="/" render={() => <Redirect to="/profiles/manage" />} />
      <Route exact path="/profiles/manage" component={PageSignin} />
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
              path="/auth/settings/:profile/callpark"
              component={NewCallPark}
            />
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
