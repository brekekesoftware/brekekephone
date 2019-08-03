import {
  Button,
  Container,
  Content,
  Fab,
  List,
  ListItem,
  Text,
  Thumbnail,
  View
} from 'native-base';

import React, { Component } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import SearchContact from './SearchContact';
import Icons from '../components-shared/Icon';

const st = StyleSheet.create({
  navright: {
    flexDirection: 'row',
    width: '30%'
  },

  btnFab: {
    backgroundColor: '#74bf53',
  },
  left:{
    width: '30%',
  },
  body:{
    width: '40%'
  },
});

const User = p => (
  <ListItem >
    <View style={st.left}>
      <Thumbnail
        source={{
          uri:
            'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg',
        }}
      />
    </View>
    <View style={st.body}>
      <Text>Aong Bao</Text>
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

const data_demo = [
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something two',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something',
  },
  {
    imageUrl: 'http://via.placeholder.com/160x160',
    title: 'something two',
  },
];

class TabUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: data_demo,
    };
  }

  render() {
    return (
      <Container>
        <Content>
          <SearchContact />
          <List>
            <ListItem itemDivider>
              <Text>A</Text>
            </ListItem>
            <FlatList
              data={this.state.data}
              renderItem={({ item: rowData }) => {
                return <User />;
              }}
            />
            <ListItem itemDivider>
              <Text>B</Text>
            </ListItem>
            <FlatList
              data={this.state.data}
              renderItem={({ item: rowData }) => {
                return <User />;
              }}
            />
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
