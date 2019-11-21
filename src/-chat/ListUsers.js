import React from 'react';

import { TouchableOpacity } from '../native/Rn';
import Item from '../shared/ItemUser';

const ListUsers = p => (
  <React.Fragment>
    {p.userids.map((id, i) => (
      <TouchableOpacity key={i} onPress={() => p.userselect(id)}>
        <Item
          key={id}
          {...p.userbyid[id]}
          detail={true}
          lastmess={p.lastmess(id)}
        />
      </TouchableOpacity>
    ))}
    {p.groupids.map((id, i) => (
      <TouchableOpacity key={i} onPress={() => p.groupselect(id)}>
        <Item
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
