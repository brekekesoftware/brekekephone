import {
  mdiAccountCircleOutline,
  mdiMessageTextOutline,
  mdiNumeric,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';
import { Button, Footer, FooterTab, Text } from 'native-base';
import React from 'react';

import Icon from '../../shared/Icon';

class FooterTabs extends React.Component {
  render() {
    const p = this.props;
    return (
      <Footer
        style={{
          paddingBottom: 0,
        }}
      >
        <FooterTab>
          <Button onPress={p.pressUsers}>
            <Icon path={mdiAccountCircleOutline} />
            <Text>CONTACTS</Text>
          </Button>
          <Button onPress={p.pressCallsRecent}>
            <Icon path={mdiPhoneOutline} />
            <Text>RECENTS</Text>
          </Button>
          <Button onPress={p.pressCallsCreate}>
            <Icon path={mdiNumeric} />
            <Text>CALL</Text>
          </Button>
          {p.chatsEnabled && (
            <Button onPress={p.pressChats}>
              <Icon path={mdiMessageTextOutline} />
              <Text>CHAT</Text>
            </Button>
          )}
          <Button onPress={p.pressSettings}>
            <Icon path={mdiSettingsOutline} />
            <Text>SETTINGS</Text>
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

export default FooterTabs;
