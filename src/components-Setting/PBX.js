import { mdiAccount, mdiDesktopClassic, mdiHome, mdiUsb } from '@mdi/js';
import { Body, Left, List, ListItem, Text } from 'native-base';
import React from 'react';

import SvgIcon from '../shared/SvgIcon';

class PBX extends React.Component {
  render() {
    const profile = this.props.profile;

    return (
      <List>
        <ListItem itemDivider>
          <Text>PBX</Text>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <SvgIcon path={mdiAccount} />
          </Left>
          <Body>
            <Text note>USERNAME</Text>
            <Text>{profile?.pbxUsername}</Text>
          </Body>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <SvgIcon path={mdiHome} />
          </Left>
          <Body>
            <Text note>TENANT</Text>
            <Text>{profile?.pbxTenant}</Text>
          </Body>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <SvgIcon path={mdiDesktopClassic} />
          </Left>
          <Body>
            <Text note>HOST NAME</Text>
            <Text>{profile?.pbxHostname}</Text>
          </Body>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <SvgIcon path={mdiUsb} />
          </Left>
          <Body>
            <Text note>PORT</Text>
            <Text>{profile?.pbxPort}</Text>
          </Body>
        </ListItem>
      </List>
    );
  }
}

export default PBX;
