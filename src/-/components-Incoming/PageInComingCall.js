import { mdiAccountGroup, mdiArrowLeft } from '@mdi/js';
import {
  Button,
  Container,
  Content,
  H2,
  Header,
  Icon,
  Left,
  Right,
  Text,
  View,
} from 'native-base';
import React from 'react';

import SvgIcon from '../../shared/SvgIcon';
import CallBar from './CallBar';
import HangUpComponent from './HangUp';

class PageInComingCall extends React.Component {
  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button transparent>
              <SvgIcon path={mdiArrowLeft} />
            </Button>
          </Left>
          <Right>
            <Button transparent>
              <SvgIcon path={mdiAccountGroup} />
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
