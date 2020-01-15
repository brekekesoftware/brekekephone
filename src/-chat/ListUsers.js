import React from 'react';

import { TouchableOpacity } from '../-/Rn';
import UserItem from '../-contact/UserItem';

const ListUsers = p => (
  <React.Fragment>
    {p.userids.map((id, i) => {
      if (isNaN(id))
        return (
          <TouchableOpacity key={i} onPress={() => p.userselect(id)}>
            <UserItem
              key={id}
              {...p.userbyid[id]}
              lastMessage={p.lastmess(id)?.text}
            />
          </TouchableOpacity>
        );
      return null;
    })}
    {p.groupids.map((id, i) => (
      <TouchableOpacity key={i} onPress={() => p.groupselect(id)}>
        <UserItem
          key={id}
          {...p.groupbyid[id]}
          lastMessage={p.lastmess(id)?.text}
        />
      </TouchableOpacity>
    ))}
  </React.Fragment>
);

export default ListUsers;
