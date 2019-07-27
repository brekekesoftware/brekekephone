import { Button, H3, Icon, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import variable from '../native-base-theme/variables/platform';
import { std } from '../styleguide';

const st = StyleSheet.create({
  container: {
    height: 60,
    top: 15,
    right: 0,
    left: 0,
    flexDirection: 'row',
    borderBottomColor: variable.toolbarDefaultBorder,
    borderBottomWidth: 1,
  },

  available: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  right: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  bodyIcon: {
    fontSize: 15,
    color: '#5cb85c',
  },

  body: {
    lineHeight: std.gap.sm,
  },
});

class HeaderChat extends React.Component {
  render() {
    return (
      <View style={st.container}>
        <View style={st.left}>
          <Button transparent dark>
            <Icon name="arrow-back" type="MaterialIcons" />
          </Button>
        </View>
        <View style={st.body}>
          <H3>Aerald Richards</H3>
          <View style={st.available}>
            <Icon
              style={st.bodyIcon}
              name="fiber-manual-record"
              type="MaterialIcons"
            />
            <Text note>AVAILABLE</Text>
          </View>
        </View>
        <View style={st.right}>
          <Button transparent dark>
            <Icon name="search" type="MaterialIcons" />
          </Button>
          <Button transparent dark>
            <Icon name="call" type="MaterialIcons" />
          </Button>
        </View>
      </View>
    );
  }
}

export default HeaderChat;
