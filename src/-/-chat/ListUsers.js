import { observer } from 'mobx-react';
import React from 'react';

import UserItem from '../-contact/UserItem';
import g from '../global';
import chatStore from '../global/chatStore';
import { StyleSheet, TouchableOpacity } from '../Rn';

const css = StyleSheet.create({
  Unread: {
    backgroundColor: g.colors.primaryFn(0.5),
  },
});

const ListUsers = p => (
  <React.Fragment>
    {p.groupIds
      .filter(id => id)
      .map(id => (
        <TouchableOpacity
          key={id}
          onPress={() => p.onGroupSelect(id)}
          style={chatStore.getThreadConfig(id).isUnread && css.Unread}
        >
          <UserItem
            key={id}
            {...p.groupById[id]}
            lastMessage={p.getLastChat(id)?.text}
          />
        </TouchableOpacity>
      ))}
    {p.userIds
      .filter(id => id)
      .map(id => (
        <TouchableOpacity
          key={id}
          onPress={() => p.onUserSelect(id)}
          style={chatStore.getThreadConfig(id).isUnread && css.Unread}
        >
          <UserItem
            key={id}
            {...p.userById[id]}
            lastMessage={p.getLastChat(id)?.text}
          />
        </TouchableOpacity>
      ))}
  </React.Fragment>
);

export default observer(ListUsers);
