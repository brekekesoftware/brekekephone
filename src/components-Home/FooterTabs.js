import { Badge, Button, Footer, FooterTab, Text } from 'native-base';
import React, { Component } from 'react';

import Icons from '../components-shared/Icon';

class FooterTabs extends Component {
  render() {
    return (
      <Footer
        style={{
          paddingBottom: 0,
        }}
      >
        <FooterTab>
          <Button>
            <Icons name="contacts" />
            <Text>CONTACTS</Text>
          </Button>
          <Button badge>
            <Badge brekeke>
              <Text>2</Text>
            </Badge>
            <Icons name="call" />
            <Text>RECENTS</Text>
          </Button>
          <Button>
            <Icons name="dialpad" />
            <Text>CALL</Text>
          </Button>
          <Button>
            <Icons name="chat" />
            <Text>CHAT</Text>
          </Button>
          <Button>
            <Icons name="settings" />
            <Text>SETTINGS</Text>
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

export default FooterTabs;
