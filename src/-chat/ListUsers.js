import React from 'react';

import UserItem from '../-contact/UserItem';
import { TouchableOpacity } from '../native/Rn';

const ListUsers = p => (
  <React.Fragment>
    {p.userids.map((id, i) => (
      <TouchableOpacity key={i} onPress={() => p.userselect(id)}>
        <UserItem
          key={id}
          {...p.userbyid[id]}
          detail={true}
          lastmess={p.lastmess(id)}
        />
      </TouchableOpacity>
    ))}
    {p.groupids.map((id, i) => (
      <TouchableOpacity key={i} onPress={() => p.groupselect(id)}>
        <UserItem
          key={id}
          {...p.groupbyid[id]}
          detail={true}
          lastmess={p.lastmess(id)}
        />
      </TouchableOpacity>
    ))}
  </React.Fragment>
);

export default ListUsers;
