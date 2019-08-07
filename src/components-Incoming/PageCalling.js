import {
  Button,
  Container,
  Content,
  H2,
  Header,
  Left,
  Right,
  Text,
} from 'native-base';
import React from 'react';

import Icons from '../components-shared/Icon';
import HangUpComponent from './HangUp';

class PageCalling extends React.Component {
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
              <Icons name="group" />
            </Button>
          </Right>
        </Header>
        <Content>
          <Left leftpd18>
            <H2>Aerald Richards</H2>
            <Text>VOICE CALLING</Text>
          </Left>
          <Left leftmgt100>
            <HangUpComponent />
          </Left>
        </Content>
      </Container>
    );
  }
}

export default PageCalling;
