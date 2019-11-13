import React from 'react';

import { TouchableOpacity } from '../native/Rn';
import Field from '../shared/Field';
import Item from '../shared/ItemUser';

const ListUsers = p => (
  <React.Fragment>
    <Field isGroup />
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
  </React.Fragment>
);

export default ListUsers;
