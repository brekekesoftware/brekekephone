import {
  Body,
  Content,
  Left,
  ListItem,
  Right,
  Text,
  Thumbnail,
} from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

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
      <Thumbnail source={{ uri: p.avatar }} />
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
        {p.ids.map(id => (
          <User key={id} {...p.byid[id]} select={() => p.select(id)} />
        ))}
      </Content>
    );
  }
}

export default ListChats;
