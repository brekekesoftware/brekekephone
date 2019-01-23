import { routerReducer, push, getLocation, goBack } from 'react-router-redux';
import {
  parse as queryStringToObject,
  stringify as objectToQueryString,
} from 'query-string';

export default {
  prefix: 'router',
  reduce: routerReducer,
  getter: {
    getQuery: state => queryStringToObject(getLocation(state).search),
  },
  action: {
    goBack,
    goToProfilesManage: () => push('/profiles/manage'),
    goToProfilesCreate: () => push('/profiles/create'),
    goToProfileUpdate: profile => push(`/profile/${profile}/update`),
    goToProfileSignin: profile => push(`/profile/${profile}/signin`),
    goToAuth: () => push('/auth'),
    goToSettings: () => push('/auth/settings'),
    goToUsersBrowse: () => push('/auth/users'),
    goToCallsManage: () => push('/auth/calls/manage'),
    goToCallsCreate: () => push('/auth/calls/create'),
    goToCallsRecent: () => push('/auth/calls/recent'),
    goToCallKeypad: call => push(`/auth/call/${call}/keypad`),
    goToCallTransferDial: call => push(`/auth/call/${call}/transfer/dial`),
    goToCallTransferAttend: call => push(`/auth/call/${call}/transfer/attend`),
    goToCallPark: call => push(`/auth/call/${call}/park`),
    goToChatsRecent: () => push('/auth/chats/recent'),
    goToChatGroupsCreate: () => push('/auth/chat-groups/create'),
    goToBuddyChatsRecent: buddy => push(`/auth/chats/buddy/${buddy}/recent`),
    goToGroupChatsRecent: group => push(`/auth/chats/group/${group}/recent`),
    goToChatGroupInvite: group => push(`/auth/chat-group/${group}/invite`),
    goToPhonebooksBrowse: () => push('/auth/phonebooks/browse'),
    goToContactsBrowse: query =>
      push(`/auth/contacts/browse?${objectToQueryString(query)}`),
    goToContactsCreate: query =>
      push(`/auth/contacts/create?${objectToQueryString(query)}`),
  },
};
