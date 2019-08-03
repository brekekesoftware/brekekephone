import {
  Content,
  List,
  ListItem,
  Text,
  Thumbnail,
  Title,
  View,
} from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import variable from '../native-base-theme/variables/platform';

const st = StyleSheet.create({
  container: {
    marginTop: variable.listItemPadding + 6,
  },

  item: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'flex-start',
    paddingVertical: variable.listItemPadding + 3,
  },

  listitem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  leftAvatar: {
    marginLeft: variable.listItemPadding + 6,
    marginTop: variable.listItemPadding - 5,
  },

  name: {
    textAlign: 'left',
  },

  bodyTitle: {
    flexDirection: 'row',
  },

  body: {
    paddingLeft: variable.listItemPadding + 3,
    paddingRight: variable.listItemPadding + 6,
  },
});

class ChatMessages extends React.Component {
  render() {
    return (
      <Content>
        <List style={st.container}>
          <ListItem style={st.listitem}>
            <View style={st.item}>
              <View style={st.left}>
                <Thumbnail
                  style={st.leftAvatar}
                  small
                  source={{
                    uri:
                      'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg',
                  }}
                />
              </View>
              <View style={st.body}>
                <View style={st.bodyTitle}>
                  <Title style={st.name}>Sankhadeep</Title>
                  <Text note>2:11 PM</Text>
                </View>
                <Text numberOfLines={10}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vestibulum tincidunt mi est, non congue justo auctor sit amet.
                  Praesent non nisi quis enim luctus imperdiet eu sit amet
                  lacus.
                </Text>
              </View>
            </View>
            <View>
              <Text note>02/10/2018</Text>
            </View>
          </ListItem>

          <ListItem style={st.listitem}>
            <View style={st.item}>
              <View style={st.left}>
                <Thumbnail
                  style={st.leftAvatar}
                  small
                  source={{
                    uri:
                      'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg',
                  }}
                />
              </View>
              <View style={st.body}>
                <View style={st.bodyTitle}>
                  <Title style={st.name}>Sankhadeep</Title>
                  <Text note>2:11 PM</Text>
                </View>
                <Text numberOfLines={10}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Vestibulum tincidunt mi est, non congue justo auctor sit amet.
                  Praesent non nisi quis enim luctus imperdiet eu sit amet
                  lacus.
                </Text>
              </View>
            </View>
          </ListItem>
        </List>
      </Content>
    );
  }
}

export default ChatMessages;
