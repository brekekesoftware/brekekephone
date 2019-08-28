import {
  Body,
  Button,
  Content,
  Left,
  ListItem,
  Right,
  Text,
} from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import Avatar from '../components-shared/Avatar';

const st = StyleSheet.create({
  navright: {
    flexDirection: 'row',
  },

  btnFab: {
    backgroundColor: '#74bf53',
  },
});

const User = p => (
  <ListItem listChat onPress={p.select}>
    <Left>
      <Avatar
        source={p.avatar}
        online={p.online}
        offline={p.offline}
        busy={p.busy}
      />
    </Left>
    <Body>
      {(() => {
        if (p.name) {
          return <Text>{p.name}</Text>;
        } else {
          return <Text>{p.id}</Text>;
        }
      })()}
      <Text note>Tell me more about…</Text>
    </Body>
    <Right style={st.navright}>
      <Text note>05/07/2019</Text>
    </Right>
  </ListItem>
);

class ListChats extends React.Component {
  render() {
    const p = this.props;
    return (
      <Content>
        <Button onPress={p.createGroup}>
          <Text>Create group</Text>
        </Button>
        {p.ids.map(id => (
          <User key={id} {...p.byid[id]} select={() => p.select(id)} />
        ))}
      </Content>
    );
  }
}

export default ListChats;
