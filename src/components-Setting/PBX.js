import { Body, Left, List, ListItem, Text } from 'native-base';
import React, { Component } from 'react';

import Icons from '../components-shared/Icon';

class PbxComponent extends Component {
  render() {
    const profile = this.props.profile;

    return (
      <List>
        <ListItem itemDivider>
          <Text>PBX</Text>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <Icons name="person" />
          </Left>
          <Body>
            <Text note>USERNAME</Text>
            <Text>{profile?.pbxUsername}</Text>
          </Body>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <Icons name="home" />
          </Left>
          <Body>
            <Text note>TENANT</Text>
            <Text>{profile?.pbxTenant}</Text>
          </Body>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <Icons name="domain" />
          </Left>
          <Body>
            <Text note>HOST NAME</Text>
            <Text>{profile?.pbxHostname}</Text>
          </Body>
        </ListItem>
        <ListItem listUser noBorder>
          <Left>
            <Icons name="usb" />
          </Left>
          <Body>
            <Text note>POST</Text>
            <Text>{profile?.pbxPort}</Text>
          </Body>
        </ListItem>
      </List>
    );
  }
}

export default PbxComponent;
