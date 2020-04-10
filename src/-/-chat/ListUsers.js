import moment from 'moment';
import React from 'react';

import UserItem from '../-contact/UserItem';
import { TouchableOpacity } from '../Rn';

const ListUsers = p => (
  <React.Fragment>
    {p.groupIds
      .filter(id => id)
      .map(id => (
        <TouchableOpacity key={id} onPress={() => p.onGroupSelect(id)}>
          <UserItem
            key={id}
            {...p.groupById[id]}
            lastMessage={p.getLastChat(id)?.text}
            isRecentChat={p.isRecentChat}
            lastMessageDate={moment(p.getLastChat(id)?.created).format(
              'DD/MM/YYYY',
            )}
          />
        </TouchableOpacity>
      ))}
    {p.userIds
      .filter(id => id)
      .map(id => (
        <TouchableOpacity key={id} onPress={() => p.onUserSelect(id)}>
          <UserItem
            key={id}
            {...p.userById[id]}
            lastMessage={p.getLastChat(id)?.text}
            isRecentChat={p.isRecentChat}
            lastMessageDate={moment(p.getLastChat(id)?.created).format(
              'DD/MM/YYYY',
            )}
          />
        </TouchableOpacity>
      ))}
  </React.Fragment>
);

export default ListUsers;
