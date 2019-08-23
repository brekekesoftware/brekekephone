import {
  Body,
  Content,
  Left,
  ListItem,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React from 'react';

class ChatMessages extends React.Component {
  render() {
    return (
      <Content>
        <ListItem chat>
          <Left>
            <Thumbnail
              source={{
                uri:
                  'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?cs=srgb&dl=beauty-bloom-blue-67636.jpg&fm=jpg',
              }}
            />
          </Left>
          <Body>
            <View>
              <Text>Duan huynh</Text>
              <Text note>12/23/2019</Text>
            </View>
            <Text>adfdgjojfosjfoisdhfijewiojeoiw</Text>
          </Body>
        </ListItem>
      </Content>
    );
  }
}

export default ChatMessages;
