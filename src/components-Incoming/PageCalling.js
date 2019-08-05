import {
  Button,
  Container,
  H2,
  Header,
  Left,
  Right,
  Text,
  Content,
} from 'native-base';
import React, { Component } from 'react';

import HangUpComponent from './HangUp';
import Icons from '../components-shared/Icon';


class PageCalling extends Component {
  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button>
              <Icons name="arrow-back" />
            </Button>
          </Left>
          <Right>
            <Button>
              <Icons name="group"  />
            </Button>
          </Right>
        </Header>
        <Content>
          <Left leftpd18>
            <H2>Aerald Richards</H2>
            <Text>VOICE CALLING</Text>
          </Left>
          <Left leftmgt100>
            <HangUpComponent/>
          </Left>
        </Content>
      </Container>
    );
  }
}

export default PageCalling;
