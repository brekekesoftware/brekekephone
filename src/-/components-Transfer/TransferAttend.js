import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiPhoneOff,
} from '@mdi/js';
import {
  Button,
  Container,
  Content,
  H2,
  Header,
  Left,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React from 'react';

import Icon from '../../shared/Icon';

class TransferAttend extends React.Component {
  render() {
    const p = this.props;
    const call = p.call;
    const { resolveMatch } = p;
    const usersource = resolveMatch(call?.partyNumber);
    const usertarget = resolveMatch(call?.transfering);
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button onPress={p.back}>
              <Icon path={mdiArrowLeft} />
            </Button>
          </Left>
        </Header>
        <Content>
          <Left leftpd18>
            <H2>Attended Transfer</H2>
          </Left>
          <View av_transfer>
            <View center>
              <Thumbnail source={{ uri: usersource?.avatar }} />
              <Text>From</Text>
              <H2>{call?.partyName}</H2>
            </View>
            <View center>
              <Icon path={mdiArrowRight} />
            </View>
            <View center>
              <Thumbnail source={{ uri: usertarget?.avatar }} />
              <Text>To</Text>
              <H2>{call?.transfering}</H2>
            </View>
          </View>
          <View av_transfer>
            <View btncall>
              <Button bordered dark transparent onPress={p.hangup}>
                <Icon path={mdiPhoneOff} />
              </Button>
              <View>
                <Text>CANCEL</Text>
                <Text>TRANSFER</Text>
              </View>
            </View>
            <View btncall>
              <Button bordered danger onPress={p.stop}>
                <Icon path={mdiPhoneHangup} />
              </Button>
              <View>
                <Text>END CALL &</Text>
                <Text>COMPLETE TRANSFER</Text>
              </View>
            </View>
            <View btncall>
              <Button bordered dark onPress={p.join}>
                <Icon path={mdiPhoneForward} />
              </Button>
              <View>
                <Text>CONFERENCE</Text>
              </View>
            </View>
          </View>
        </Content>
      </Container>
    );
  }
}

export default TransferAttend;
