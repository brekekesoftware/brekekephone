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
          uri:
            'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg',
        }}
      />
    </Left>
    <Body>
      <Text>Aong Bao</Text>
      <Text note="true">Phonebook Name</Text>
    </Body>
    <Right>
      <Button>
        <Icons name="call" />
      </Button>
      <Button>
        <Icons name="info" />
      </Button>
    </Right>
  </ListItem>
);

let data_demo = [
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

class TabPhoneBook extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: data_demo,
    };
  }

  render() {
    return (
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
    );
  }
}

export default TabPhoneBook;
