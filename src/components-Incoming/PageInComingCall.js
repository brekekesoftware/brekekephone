import {
  Button,
  Container,
  H2,
  Header,
  Left,
  Right,
  Text,
  View,
  Content
} from 'native-base';
import React, { Component } from 'react';

import CallBar from './CallBar';
import HangUpComponent from './HangUp';
import Icons from '../components-shared/Icon';


class PageInComingCall extends Component {
  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button transparent >
              <Icons name="arrow-back" />
            </Button>
          </Left>
          <Right>
            <Button transparent >
              <Icons name="group" />
            </Button>
          </Right>
        </Header>
        <Content>
          <Left leftpd18>
            <H2>Aerald Richards</H2>
            <Text>VOICE CALLING</Text>
          </Left>
        <View>
          <CallBar />
        </View>
        <Left leftmgt30>
          <HangUpComponent />
        </Left>
        </Content>
      </Container>
    );
  }
}

export default PageInComingCall;
