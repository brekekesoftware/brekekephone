import { mdiArrowLeft, mdiMagnify, mdiPhone, mdiRecord } from '@mdi/js';
import { Body, Button, Header, Left, Right, Text, View } from 'native-base';
import React from 'react';

import SvgIcon from '../components-shared/SvgIcon';

class HeaderChat extends React.Component {
  render() {
    const p = this.props;
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
          <View>
            <SvgIcon path={mdiRecord} />
            <Text note>AVAILABLE</Text>
          </View>
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
