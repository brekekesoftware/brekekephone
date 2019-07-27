import {
  Button,
  Container,
  H2,
  Header,
  Icon,
  Left,
  Right,
  Text,
  View,
} from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import { std } from '../styleguide';
import HangUpComponent from './HangUp';

const st = StyleSheet.create({
  containerDisplay: {
    height: '30%',
  },

  containerName: {
    padding: std.gap.lg * 2,
  },

  contaiHangUp: {
    top: '50%',
  },
});

class PageCalling extends Component {
  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button transparent dark>
              <Icon name="arrow-back" type="MaterialIcons" />
            </Button>
          </Left>
          <Right>
            <Button transparent dark>
              <Icon name="group" type="MaterialIcons" />
            </Button>
          </Right>
        </Header>
        <View style={st.containerName}>
          <H2>Aerald Richards</H2>
          <Button small success>
            <Text>VOICE CALLING</Text>
          </Button>
        </View>
        <View style={st.contaiHangUp}>
          <HangUpComponent />
        </View>
      </Container>
    );
  }
}

export default PageCalling;
