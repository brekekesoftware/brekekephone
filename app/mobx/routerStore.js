import { createHashHistory, createMemoryHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import qs from 'qs';
import { Platform } from 'react-native';

const routerStore = new RouterStore();

const history = syncHistoryWithStore(
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory(),
  routerStore,
);

export const getQuery = () => qs.parse(routerStore.location.search);
export const goBack = () => history.back();
export const goToProfilesManage = () => history.push('/profiles/manage');
export const goToProfilesCreate = () => history.push('/profiles/create');
export const goToProfileUpdate = profile =>
  history.push(`/profile/${profile}/update`);
export const goToProfileSignin = profile =>
  history.push(`/profile/${profile}/signin`);
export const goToAuth = () => history.push('/auth');
export const goToSettings = () => history.push('/auth/settings');
export const goToUsersBrowse = () => history.push('/auth/users');
export const goToCallsManage = () => history.push('/auth/calls/manage');
export const goToCallsCreate = () => history.push('/auth/calls/create');
export const goToCallsRecent = () => history.push('/auth/calls/recent');
export const goToCallKeypad = call => history.push(`/auth/call/${call}/keypad`);
export const goToCallTransferDial = call =>
  history.push(`/auth/call/${call}/transfer/dial`);
export const goToCallTransferAttend = call =>
  history.push(`/auth/call/${call}/transfer/attend`);
export const goToCallPark = call => history.push(`/auth/call/${call}/park`);
export const goToChatsRecent = () => history.push('/auth/chats/recent');
export const goToChatGroupsCreate = () =>
  history.push('/auth/chat-groups/create');
export const goToBuddyChatsRecent = buddy =>
  history.push(`/auth/chats/buddy/${buddy}/recent`);
export const goToGroupChatsRecent = group =>
  history.push(`/auth/chats/group/${group}/recent`);
export const goToChatGroupInvite = group =>
  history.push(`/auth/chat-group/${group}/invite`);
export const goToPhonebooksBrowse = () =>
  history.push('/auth/phonebooks/browse');
export const goToContactsBrowse = query =>
  history.push(`/auth/contacts/browse?${qs.stringify(query)}`);
export const goToContactsCreate = query =>
  history.push(`/auth/contacts/create?${qs.stringify(query)}`);

export { history };
export default routerStore;
