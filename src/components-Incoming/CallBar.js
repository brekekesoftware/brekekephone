import { Button, Content, Left, Text } from 'native-base';
import React, { Component } from 'react';

import Icons from '../components-shared/Icon';

class CallBar extends Component {
  render() {
    return (
      <Content>
        <Left callBar>
          <Left>
            <Button transparent dark bordered>
              <Icons name="call-split" />
            </Button>
            <Text>TRANSFER</Text>
          </Left>
          <Left>
            <Button transparent dark bordered>
              <Icons name="local-parking" />
            </Button>
            <Text>PARK</Text>
          </Left>
          <Left>
            <Button transparent dark bordered>
              <Icons name="video-call" />
            </Button>
            <Text>VIDEO</Text>
          </Left>
          <Left>
            <Button transparent dark bordered>
              <Icons name="volume-up" />
            </Button>
            <Text>MUTE</Text>
          </Left>
        </Left>
        <Left callBar>
          <Left>
            <Button transparent dark bordered>
              <Icons name="fiber-manual-record" />
            </Button>
            <Text>RECORDING</Text>
          </Left>
          <Left>
            <Button transparent dark bordered>
              <Icons name="dialpad" />
            </Button>
            <Text>KEYPAD</Text>
          </Left>
          <Left>
            <Button transparent dark bordered>
              <Icons name="pause" />
            </Button>
            <Text>HOLD</Text>
          </Left>
        </Left>
      </Content>
    );
  }
}

export default CallBar;
