import _ from 'lodash';
import {
  Button,
  Container,
  Content,
  Fab,
  List,
  ListItem,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React, { Component } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import Icons from '../components-shared/Icon';
import SearchContact from './SearchContact';

const st = StyleSheet.create({
  navright: {
    flexDirection: 'row',
    width: '30%',
  },

  btnFab: {
    backgroundColor: '#74bf53',
  },
  left: {
    width: '30%',
  },
  body: {
    width: '40%',
  },
});

const User = p => (
  <ListItem>
    <View style={st.left}>
      <Thumbnail
        source={{
          uri: p.avatar,
        }}
      />
    </View>
    <View style={st.body}>
      <Text>{p.name}</Text>
      <Text note>302</Text>
    </View>
    <View style={st.navright}>
      <Button>
        <Icons name="chat-bubble" />
      </Button>
      <Button>
        <Icons name="call" />
      </Button>
    </View>
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
      <Container>
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
        <Fab style={st.btnFab}>
          <Icons name="person-add" />
        </Fab>
      </Container>
    );
  }
}

export default TabUsers;
