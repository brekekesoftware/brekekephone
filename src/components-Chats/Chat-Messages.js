import React from 'react';
import { Content, Left, Body, Right, Text, Thumbnail, Icon, View, ListItem, List, Title } from 'native-base';
import {StyleSheet} from 'react-native';

const st = StyleSheet.create({
  container:{
    height: 60,
  },
  available: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatar:{
    marginTop: 10,
  },
  name:{
    textAlign: 'left',
  },
  containerName:{
    flexDirection: 'row',
  }
})


class ChatMessages extends React.Component {

  render() {
    return (
  		<Content>
        <List>
          <ListItem thumbnail>
            <Left style={st.avatar}>
              <Thumbnail style={st.avatar} small source={{ uri: 'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg' }} />
            </Left>
            <Body>
              <View style={st.containerName}>
                <Title style={st.name}>Sankhadeep</Title>
                <Text note> 2:11 PM</Text>
              </View>
              <Text numberOfLines={10}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tincidunt mi est, non congue justo auctor sit amet. Praesent non nisi quis enim luctus imperdiet eu sit amet lacus.</Text>
            </Body>
          </ListItem>
          <ListItem thumbnail>
            <Left>
              <Thumbnail style={st.avatar} small source={{ uri: 'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg' }} />
            </Left>
            <Body>
              <View style={st.containerName}>
                <Title style={st.name}>John Doe</Title>
                <Text note> 2:12 PM</Text>
              </View>
              <View>
                <Thumbnail square small source={{ uri: 'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg' }} />
              </View>
            </Body>
          </ListItem>
        </List>
      </Content>
    );
  }
}

export default ChatMessages;
