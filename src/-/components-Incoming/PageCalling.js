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

import SvgIcon from '../../shared/SvgIcon';
import CallBar from './CallBar';
import HangUpComponent from './HangUp';

class PageCalling extends React.Component {
  render() {
    const p = this.props;
    const new_p = { ...p, ...p.runningById[p.selectedId] };
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button onPress={new_p.browseHistory}>
              <SvgIcon path={mdiArrowLeft} />
            </Button>
          </Left>
          <Right>
            <Button>
              <SvgIcon path={mdiAccountGroup} />
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
