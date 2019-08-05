import { Button, Text, Left } from 'native-base';
import React, { Component } from 'react';

import Icons from '../components-shared/Icon';


class HangUpComponent extends Component {
  render() {
    return (
        <Left hangUp>
          <Left>
            <Button danger>
              <Icons name="call-end" />
            </Button>
            <Text>HANG UP</Text>
          </Left>
        </Left>      
    );
  }
}

export default HangUpComponent;
