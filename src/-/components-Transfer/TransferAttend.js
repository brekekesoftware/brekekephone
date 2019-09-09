import { mdiPhoneForward, mdiPhoneHangup, mdiPhoneOff } from '@mdi/js';
import {
  Button,
  Container,
  Content,
  H2,
  Header,
  Icon,
  Left,
  Text,
  Thumbnail,
  View,
} from 'native-base';
import React from 'react';

import SvgIcon from '../../shared/SvgIcon';

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
              <Icon type="MaterialIcons" name="arrow-back" />
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
              <Icon type="MaterialIcons" name="arrow-forward" />
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
                <SvgIcon path={mdiPhoneOff} />
              </Button>
              <View>
                <Text>CANCEL</Text>
                <Text>TRANSFER</Text>
              </View>
            </View>
            <View btncall>
              <Button bordered danger onPress={p.stop}>
                <SvgIcon path={mdiPhoneHangup} />
              </Button>
              <View>
                <Text>END CALL &</Text>
                <Text>COMPLETE TRANSFER</Text>
              </View>
            </View>
            <View btncall>
              <Button bordered dark onPress={p.join}>
                <SvgIcon path={mdiPhoneForward} />
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
