import { createHashHistory, createMemoryHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import qs from 'qs';
import { Platform } from 'react-native';

const routerStore = new RouterStore();
const history = syncHistoryWithStore(
  Platform.OS === 'web' ? createHashHistory() : createMemoryHistory(),
  routerStore,
);

// Wait and push history to fix some strange issues with router
const withTimeout = fn => (...args) => setTimeout(() => fn(...args), 17);

Object.assign(routerStore, {
  getQuery: () => qs.parse(routerStore.location.search.replace(/^\?*/, '')),
  goToSigninPage: withTimeout(() => history.push('/')),

  goToAuth: withTimeout(() => history.push('/auth')),
  goToBuddyChatsRecent: withTimeout(buddy =>
    history.push(`/auth/chats/buddy/${buddy}/recent`),
  ),
  goToCallKeypad: withTimeout(call =>
    history.push(`/auth/call/${call}/keypad`),
  ),
  goToCallPark: withTimeout(call => history.push(`/auth/call/${call}/park`)),
  goToCallsCreate: withTimeout(() => history.push('/auth/calls/create')),
  goToCallsManage: withTimeout(() => history.push('/auth/calls/manage')),
  goToCallsRecent: withTimeout(() => history.push('/auth/calls/recent')),
  goToCallTransferAttend: withTimeout(call =>
    history.push(`/auth/call/${call}/transfer/attend`),
  ),
  goToCallTransferDial: withTimeout(call =>
    history.push(`/auth/call/${call}/transfer/dial`),
  ),
  goToChatGroupInvite: withTimeout(group =>
    history.push(`/auth/chat-group/${group}/invite`),
  ),
  goToChatGroupsCreate: withTimeout(() =>
    history.push('/auth/chat-groups/create'),
  ),
  goToChatGroupsRecent: withTimeout(group =>
    history.push(`/auth/chats/group/${group}/recent`),
  ),
  goToChatsRecent: withTimeout(() => history.push('/auth/chats/recent')),
  goToContactsBrowse: withTimeout(query =>
    history.push(`/auth/contacts/browse?${qs.stringify(query)}`),
  ),
  goToContactsCreate: withTimeout(query =>
    history.push(`/auth/contacts/create?${qs.stringify(query)}`),
  ),
  goToPhonebooksBrowse: withTimeout(() =>
    history.push('/auth/phonebooks/browse'),
  ),
  goToProfilesCreate: withTimeout(() => history.push('/profiles/create')),
  goToProfileSignin: withTimeout(profile =>
    history.push(`/profile/${profile}/signin`),
  ),
  goToProfileUpdate: withTimeout(profile =>
    history.push(`/profile/${profile}/update`),
  ),
  goToSettings: withTimeout(() => history.push('/auth/settings')),
  goToNewCallPark: withTimeout(profile =>
    history.push(`/auth/settings/${profile}/callpark`),
  ),
  goToUsersBrowse: withTimeout(() => history.push('/auth/users')),
});

export { history };
export default routerStore;
