import { Body, Icon, Left, List, ListItem, Text } from 'native-base';
import React, { Component } from 'react';
import Icons from '../components-shared/Icon';


class PbxComponent extends Component {
  render() {
    return (
      <List>
        <ListItem itemDivider>
          <Text>PBX</Text>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icons name="person" />
          </Left>
          <Body>
            <Text note>USERNAME</Text>
            <Text>401</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icons name="home" />
          </Left>
          <Body>
            <Text note>TENANT</Text>
            <Text>Nam</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icons name="domain" />
          </Left>
          <Body>
            <Text note>HOST NAME</Text>
            <Text>apps.brekeke.com</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icons name="usb" />
          </Left>
          <Body>
            <Text note>POST</Text>
            <Text>8443</Text>
          </Body>
        </ListItem>
      </List>
    );
  }
}

export default PbxComponent;
