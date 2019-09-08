import { mdiArrowLeft, mdiMagnify, mdiPhone, mdiRecord } from '@mdi/js';
import { Body, Button, Header, Left, Right, Text, View } from 'native-base';
import React from 'react';

import SvgIcon from '../../shared/SvgIcon';

class HeaderChat extends React.Component {
  render() {
    const p = this.props;
    const u = p.resolveCreator(p.buddyId);
    return (
      <Header headerChat>
        <Left>
          <Button transparent onPress={p.back}>
            <SvgIcon path={mdiArrowLeft} />
          </Button>
        </Left>
        <Body>
          {(() => {
            if (p.buddyName) {
              return <Text>{p.buddyName}</Text>;
            } else {
              return <Text>{p.buddyId}</Text>;
            }
          })()}

          {u.status === 'online' && (
            <View>
              <SvgIcon path={mdiRecord} color="#74bf53" />
              <Text note>AVAILABLE</Text>
            </View>
          )}
          {u.status === 'busy' && (
            <View>
              <SvgIcon path={mdiRecord} color="#FF2D55" />
              <Text note>BUSY</Text>
            </View>
          )}
          {u.status === 'offline' && (
            <View>
              <SvgIcon path={mdiRecord} color="#8a8a8f" />
              <Text note>OFFLINE</Text>
            </View>
          )}
        </Body>
        <Right>
          <Button transparent>
            <SvgIcon path={mdiMagnify} />
          </Button>
          <Button transparent>
            <SvgIcon path={mdiPhone} />
          </Button>
        </Right>
      </Header>
    );
  }
}

export default HeaderChat;
