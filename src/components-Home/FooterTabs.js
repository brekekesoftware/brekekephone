import {
  mdiAccountCircleOutline,
  mdiMessageTextOutline,
  mdiNumeric,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';
import { Button, Footer, FooterTab, Text } from 'native-base';
import React from 'react';

import SvgIcon from '../components-shared/SvgIcon';

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
            <SvgIcon path={mdiAccountCircleOutline} />
            <Text>CONTACTS</Text>
          </Button>
          <Button onPress={p.pressCallsManage}>
            <SvgIcon path={mdiPhoneOutline} />
            <Text>RECENTS</Text>
          </Button>
          <Button onPress={p.pressCallsCreate}>
            <SvgIcon path={mdiNumeric} />
            <Text>CALL</Text>
          </Button>
          {p.chatsEnabled && (
            <Button onPress={p.pressChats}>
              <SvgIcon path={mdiMessageTextOutline} />
              <Text>CHAT</Text>
            </Button>
          )}
          <Button onPress={p.pressSettings}>
            <SvgIcon path={mdiSettingsOutline} />
            <Text>SETTINGS</Text>
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

export default FooterTabs;
