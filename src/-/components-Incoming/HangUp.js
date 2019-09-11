import { mdiPhoneHangup } from '@mdi/js';
import { Button, Left, Text } from 'native-base';
import React from 'react';

import Icon from '../../shared/Icon';

class HangUpComponent extends React.Component {
  render() {
    const p = this.props;

    return (
      <Left hangUp>
        <Left>
          <Button danger onPress={p.hangup}>
            <Icon path={mdiPhoneHangup} />
          </Button>
          <Text>HANG UP</Text>
        </Left>
      </Left>
    );
  }
}

export default HangUpComponent;
