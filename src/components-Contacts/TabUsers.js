import _ from 'lodash';
import {
  Body,
  Button,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Text,
  Thumbnail,
} from 'native-base';
import React, { Component } from 'react';
import { FlatList } from 'react-native';

import Icons from '../components-shared/Icon';
import SearchContact from './SearchContact';

const User = p => (
  <ListItem listUser>
    <Left>
      <Thumbnail
        source={{
          uri: p.avatar,
        }}
      />
    </Left>
    <Body>
      <Text>{p.name}</Text>
      <Text note>{p.id}</Text>
    </Body>
    <Right>
      <Button>
        <Icons name="chat-bubble" />
      </Button>
      <Button>
        <Icons name="call" />
      </Button>
    </Right>
  </ListItem>
);

class TabUsers extends Component {
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

    groups = _.orderBy(groups, 'key');
    groups.forEach(g => {
      g.users = _.orderBy(g.users, 'name');
    });

    return (
      <Content>
        <SearchContact />
        <List>
          {groups.map(g => (
            <React.Fragment key={g.key}>
              <ListItem itemDivider>
                <Text>{g.key}</Text>
              </ListItem>
              <FlatList
                data={g.users}
                renderItem={({ item: u }) => <User key={u.id} {...u} />}
              />
            </React.Fragment>
          ))}
        </List>
      </Content>
    );
  }
}

export default TabUsers;
