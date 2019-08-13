import { Button, Left, Text } from 'native-base';
import React from 'react';

import Icons from '../components-shared/Icon';

class HangUpComponent extends React.Component {
  render() {
    const p = this.props;

    return (
      <Left hangUp>
        <Left>
          <Button danger onPress={p.hangup}>
            <Icons name="call-end" />
          </Button>
          <Text>HANG UP</Text>
        </Left>
      </Left>
    );
  }
}

export default HangUpComponent;
