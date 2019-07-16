import { createHashHistory, createMemoryHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import qs from 'qs';
import { Platform } from 'react-native';

const routerStore = new RouterStore();

const history = syncHistoryWithStore(
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory(),
  routerStore,
);

export { history };
export default routerStore;

//
// routerUtils to replace the old redux router store
//

export const getQuery = () =>
  qs.parse(routerStore.location.search.replace(/^\?*/, ''));

// Try to update the history after a tick to avoid infinite loop
const withTimeout = fn => (...args) => {
  setTimeout(() => {
    fn(...args);
  }, 17);
};

export const goToAuth = withTimeout(() => {
  history.push('/auth');
});
export const goToBuddyChatsRecent = withTimeout(buddy => {
  history.push(`/auth/chats/buddy/${buddy}/recent`);
});
export const goToCallKeypad = withTimeout(call => {
  history.push(`/auth/call/${call}/keypad`);
});
export const goToCallPark = withTimeout(call => {
  history.push(`/auth/call/${call}/park`);
});
export const goToCallsCreate = withTimeout(() => {
  history.push('/auth/calls/create');
});
export const goToCallsManage = withTimeout(() => {
  history.push('/auth/calls/manage');
});
export const goToCallsRecent = withTimeout(() => {
  history.push('/auth/calls/recent');
});
export const goToCallTransferAttend = withTimeout(call => {
  history.push(`/auth/call/${call}/transfer/attend`);
});
export const goToCallTransferDial = withTimeout(call => {
  history.push(`/auth/call/${call}/transfer/dial`);
});
export const goToChatGroupInvite = withTimeout(group => {
  history.push(`/auth/chat-group/${group}/invite`);
});
export const goToChatGroupsCreate = withTimeout(() => {
  history.push('/auth/chat-groups/create');
});
export const goToChatGroupsRecent = withTimeout(group => {
  history.push(`/auth/chats/group/${group}/recent`);
});
export const goToChatsRecent = withTimeout(() => {
  history.push('/auth/chats/recent');
});
export const goToContactsBrowse = withTimeout(query => {
  history.push(`/auth/contacts/browse?${qs.stringify(query)}`);
});
export const goToContactsCreate = withTimeout(query => {
  history.push(`/auth/contacts/create?${qs.stringify(query)}`);
});
export const goToPhonebooksBrowse = withTimeout(() => {
  history.push('/auth/phonebooks/browse');
});
export const goToProfilesCreate = withTimeout(() => {
  history.push('/profiles/create');
});
export const goToProfileSignin = withTimeout(profile => {
  history.push(`/profile/${profile}/signin`);
});
export const goToProfilesManage = withTimeout(() => {
  history.push('/profiles/manage');
});
export const goToProfileUpdate = withTimeout(profile => {
  history.push(`/profile/${profile}/update`);
});
export const goToSettings = withTimeout(() => {
  history.push('/auth/settings');
});
export const goToUsersBrowse = withTimeout(() => {
  history.push('/auth/users');
});
