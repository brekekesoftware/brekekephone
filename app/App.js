import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider as StoreProvider } from 'react-redux';
import { ModelProvider, combineModels } from 'redux-model';
import { Route, Redirect } from 'react-router-native';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { createHashHistory, createMemoryHistory } from 'history';
import { Platform, StyleSheet, View, ActivityIndicator } from 'react-native';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';

import './polyfill';
import ProfilesManage from './modules/profiles-manage';
import ProfilesCreate from './modules/profiles-create';
import ProfilesCreate2 from './components-Profile/PageProfileCreate';
import ProfileUpdate from './modules/profile-update';
import ProfileSignin from './modules/profile-signin';
import UsersBrowse from './modules/users-browse';
import CallsManage from './modules/calls-manage';
import CallsCreate from './modules/calls-create';
import CallsRecent from './modules/calls-recent';
import CallsNotify from './modules/calls-notify';
import CallVoices from './modules/call-voices';
import CallVideos from './modules/call-videos';
import CallTransferDial from './modules/call-transfer-dial';
import CallTransferAttend from './modules/call-transfer-attend';
import CallKeypad from './modules/call-keypad';
import CallPark from './modules/call-park';
import ChatsRecent from './modules/chats-recent';
import BuddyChatsRecent from './modules/buddy-chats-recent';
import BuddyChatsRecent2 from './components-Chat/PageBuddyChatRecent';
import BuddyChatsNotify from './modules/buddy-chats-notify';
import GroupChatsRecent from './modules/group-chats-recent';
import ChatGroupsCreate from './modules/chat-groups-create';
import ChatGroupsNotify from './modules/chat-groups-notify';
import ChatGroupInvite from './modules/chat-group-invite';
import PhonebooksBrowse from './modules/phonebooks-browse';
import ContactsBrowse from './modules/contacts-browse';
import ContactsCreate from './modules/contacts-create';
import Tabbar from './modules/tabbar';
import Callbar from './modules/callbar';
import Settings from './modules/settings';
import Auth from './modules/auth';
import WithoutStatusBar from './modules/auth/WithoutStatusBar';
import PBXAuth from './modules/pbx-auth';
import SIPAuth from './modules/sip-auth';
import UCAuth from './modules/uc-auth';
import Notifications from './modules/notifications';
import ToastsNotify from './modules/toasts-notify';
import APIProvider from './apis';
import StatusBar from './modules/statusbar';
import * as models from './models';

const { getter, action, reduce } = combineModels(models);

const persistedReducers = ['profiles', 'recentCalls'];
const persistConfig = {
  key: 'brekeke-phone',
  storage,
  whitelist: persistedReducers,
  version: '3.0.0',
};
const storeReducer = persistReducer(persistConfig, reduce);

const routerHistory =
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory();
const router = routerMiddleware(routerHistory);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const storeEnhancer = composeEnhancers(applyMiddleware(router));

export const store = createStore(storeReducer, storeEnhancer);
const storePersistor = persistStore(store);

const Loading = () => (
  <View style={StyleSheet.absoluteFill}>
    <ActivityIndicator />
  </View>
);

const Routing = () => (
  <View style={StyleSheet.absoluteFill}>
    <StatusBar />
    <WithoutStatusBar>
      <Route exact path="/" render={() => <Redirect to="/profiles/manage" />} />
      <Route exact path="/profiles/manage" component={ProfilesManage} />
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
      <Route path="/auth" component={CallVoices} />
      <Route path="/auth" component={Tabbar} />
      <Route path="/auth" component={CallVideos} />
      <Route path="/auth" component={SIPAuth} />
      <Route path="/auth" component={UCAuth} />
      <Route path="/auth" component={PBXAuth} />
    </WithoutStatusBar>
    <Notifications>
      <Route path="/auth" component={CallsNotify} />
      <Route path="/auth" component={ChatGroupsNotify} />
      <Route path="/auth" component={BuddyChatsNotify} />
      <ToastsNotify />
    </Notifications>
  </View>
);

const App = () => (
  <StoreProvider store={store}>
    <PersistGate persistor={storePersistor} loading={<Loading />}>
      <ModelProvider getter={getter} action={action}>
        <APIProvider>
          <ConnectedRouter history={routerHistory}>
            <Routing />
          </ConnectedRouter>
        </APIProvider>
      </ModelProvider>
    </PersistGate>
  </StoreProvider>
);

export default App;
