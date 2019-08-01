import {
  Button,
  Icon,
  ListItem,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

const st = StyleSheet.create({
  left:{
    width: '30%',
  },
  body:{
    width: '40%'
  },
  right:{
    width: '30%',
    paddingLeft: 15,
  }
});

class User extends Component {
  render() {
    return (
      <ListItem>
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
          <Text note>Missed at 6/8/2018</Text>
        </View>
        <View style={st.right}>
          <Button transparent dark>
            <Icon name="call" type="MaterialIcons" />
          </Button>
        </View>
      </ListItem>
    );
  }
}

export default User;
