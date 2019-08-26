import { mdiMessage, mdiPhone } from '@mdi/js';
import orderBy from 'lodash/orderBy';
import { Body, Button, Left, ListItem, Right, Text } from 'native-base';
import React from 'react';

import Avatar from '../components-shared/Avatar';
import SvgIcon from '../components-shared/SvgIcon';
import SearchContact from './SearchContact';

class TabUsers extends React.Component {
  render() {
    const p = this.props;
    const users = p.userIds.map(p.resolveUser);
    const map = {};
    users.forEach(u => {
      u.name = u.name || u.id;
      let c0 = u.name.charAt(0).toUpperCase();
      if (!/[A-Z]/.test(c0)) {
        c0 = '#';
      }
      if (!map[c0]) {
        map[c0] = [];
      }
      map[c0].push(u);
    });

    let groups = Object.keys(map).map(k => ({
      key: k,
      users: map[k],
    }));

    groups = orderBy(groups, 'key');
    groups.forEach(g => {
      g.users = orderBy(g.users, 'name');
    });

    return (
      <React.Fragment>
        <SearchContact />
        {groups.map(g => (
          <React.Fragment key={g.key}>
            <ListItem itemDivider>
              <Text>{g.key}</Text>
            </ListItem>
            {g.users.map(u => (
              <ListItem key={u.id} listUser>
                <Left>
                  <Avatar
                    source={u.avatar}
                    online={u.chatOnline}
                    offline={u.chatOffline}
                    busy={u.chatBusy}
                  />
                </Left>
                <Body>
                  <Text>{u.name}</Text>
                  <Text note>{u.id}</Text>
                </Body>
                <Right>
                  <Button onPress={() => p.chat(u.id)}>
                    <SvgIcon path={mdiMessage} />
                  </Button>
                  <Button onPress={() => p.callVoice(u.id)}>
                    <SvgIcon path={mdiPhone} />
                  </Button>
                </Right>
              </ListItem>
            ))}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  }
}

export default TabUsers;
