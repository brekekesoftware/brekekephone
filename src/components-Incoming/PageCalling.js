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

import Icons from '../components-shared/Icon';
import CallBar from './CallBar';
import HangUpComponent from './HangUp';

class PageCalling extends React.Component {
  render() {
    const p = this.props;

    const new_p = { ...p, ...p.runningById[p.selectedId] };
    console.warn(new_p);
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button onPress={new_p.browseHistory}>
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
            <H2>{new_p.partyName}</H2>
            {!new_p.holding && <Text>VOICE CALLING</Text>}
            {new_p.holding && <Text>HOLDING</Text>}
          </Left>
          {new_p.answered && !new_p.holding && (
            <View>
              <CallBar {...new_p} />
              <Left leftmgt15>
                <HangUpComponent hangup={new_p.hangup} />
              </Left>
            </View>
          )}
          {!new_p.answered && !new_p.incoming && (
            <View>
              <Left lefttop200>
                <HangUpComponent hangup={new_p.hangup} />
              </Left>
            </View>
          )}
        </Content>
      </Container>
    );
  }
}

export default PageCalling;
