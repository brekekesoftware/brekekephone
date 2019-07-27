import {
  Button,
  Footer,
  FooterTab,
  Form,
  Icon,
  Input,
  Item,
  Label,
  View,
} from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import variable from '../native-base-theme/variables/platform';
import { std } from '../styleguide';

const st = StyleSheet.create({
  footer: {
    flexDirection: 'row',
  },
});

class FooterChats extends React.Component {
  render() {
    return (
      <View
        style={{
          paddingBottom: 0,
        }}
      >
        <View style={st.footer}>
          <Button vertical>
            <Icon name="add" type="MaterialIcons" />
          </Button>
          <Form>
            <Item inlineLabel>
              <Label>Message</Label>
              <Input />
            </Item>
          </Form>
          <Button>
            <Icon name="sentiment-very-satisfied" type="MaterialIcons" />
          </Button>
          <Button>
            <Icon name="send" type="MaterialIcons" />
          </Button>
        </View>
      </View>
    );
  }
}

export default FooterChats;
