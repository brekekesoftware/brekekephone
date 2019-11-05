import React from 'react';

import { TouchableOpacity } from '../native/Rn';
import FieldGroup from '../shared/FieldGroup';
import Item from '../shared/ItemUser';

const ListUsers = p => (
  <React.Fragment>
    <FieldGroup>
      {p.userids.map((id, i) => (
        <TouchableOpacity onPress={() => p.userselect(id)}>
          <Item key={id} {...p.userbyid[id]} />
        </TouchableOpacity>
      ))}
      {p.groupids.map((id, i) => (
        <TouchableOpacity onPress={() => p.groupselect(id)}>
          <Item key={id} {...p.groupbyid[id]} />
        </TouchableOpacity>
      ))}
    </FieldGroup>
  </React.Fragment>
);

export default ListUsers;
