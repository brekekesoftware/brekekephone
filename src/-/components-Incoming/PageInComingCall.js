import { mdiAccountGroup, mdiArrowLeft } from '@mdi/js';
import {
  Button,
  Container,
  Content,
  H2,
  Header,
  Left,
  Right,
  Text,
  View,
} from 'native-base';
import React from 'react';

import Icon from '../../shared/Icon';
import CallBar from './CallBar';
import HangUpComponent from './HangUp';

class PageInComingCall extends React.Component {
  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button transparent>
              <Icon path={mdiArrowLeft} />
            </Button>
          </Left>
          <Right>
            <Button transparent>
              <Icon path={mdiAccountGroup} />
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
