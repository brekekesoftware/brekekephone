import { mdiArrowLeft, mdiMagnify, mdiPhone, mdiRecord } from '@mdi/js';
import { Body, Button, Header, Left, Right, Text, View } from 'native-base';
import React from 'react';

import Icon from '../../shared/Icon';

class HeaderChat extends React.Component {
  render() {
    const p = this.props;
    const u = p.resolveCreator(p.buddyId);
    return (
      <Header headerChat>
        <Left>
          <Button transparent onPress={p.back}>
            <Icon path={mdiArrowLeft} />
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

          {u.status === `online` && (
            <View>
              <Icon path={mdiRecord} color="#74bf53" />
              <Text note>AVAILABLE</Text>
            </View>
          )}
          {u.status === `busy` && (
            <View>
              <Icon path={mdiRecord} color="#FF2D55" />
              <Text note>BUSY</Text>
            </View>
          )}
          {u.status === `offline` && (
            <View>
              <Icon path={mdiRecord} color="#8a8a8f" />
              <Text note>OFFLINE</Text>
            </View>
          )}
        </Body>
        <Right>
          <Button transparent>
            <Icon path={mdiMagnify} />
          </Button>
          <Button transparent>
            <Icon path={mdiPhone} />
          </Button>
        </Right>
      </Header>
    );
  }
}

export default HeaderChat;
