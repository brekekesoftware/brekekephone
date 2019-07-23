import {
  Body,
  Button,
  Icon,
  Left,
  ListItem,
  Right,
  Text,
  Thumbnail,
} from 'native-base';
import React, { Component } from 'react';

// to do: icon note

class User extends Component {
  render() {
    return (
      <ListItem thumbnail>
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
          <Text note>Missed at 6/8/2018</Text>
        </Body>
        <Right>
          <Button transparent dark>
            <Icon name="call" />
          </Button>
        </Right>
      </ListItem>
    );
  }
}

export default User;
