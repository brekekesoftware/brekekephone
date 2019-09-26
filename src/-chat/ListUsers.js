import React from 'react';

import { TouchableOpacity } from '../native/Rn';
import FieldGroup from '../shared/FieldGroup';
import Item from '../shared/ItemUser';

const ListUsers = p => (
  <React.Fragment>
    <FieldGroup>
      {p.userids.map(id => (
        <TouchableOpacity onPress={() => p.userselect(id)}>
          <Item key={id} {...p.userbyid[id]} />
        </TouchableOpacity>
      ))}
      {p.groupids.map(id => (
        <TouchableOpacity onPress={() => p.userselect(id)}>
          <Item
            key={id}
            {...p.groupbyid[id]}
            select={() => p.groupselect(id)}
          />
        </TouchableOpacity>
      ))}
    </FieldGroup>
  </React.Fragment>
);

export default ListUsers;
