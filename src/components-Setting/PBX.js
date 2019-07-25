import React, { Component } from 'react';
import { ListItem, Left, Icon, Body, Text, List  } from 'native-base';

class PbxComponent extends Component {
	render() {
		return (
      <List>
        <ListItem itemDivider>
            <Text>PBX</Text>
          </ListItem>       
        <ListItem thumbnail noBorder>
          <Left>
            <Icon name="person" type="MaterialIcons"/>
          </Left>
          <Body>
            <Text note>USERNAME</Text>
            <Text>401</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icon name="home" type="MaterialIcons"/>
          </Left>
          <Body>
            <Text note>TENANT</Text>
            <Text>Nam</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icon name="domain" type="MaterialIcons"/>
          </Left>
          <Body>
            <Text note>HOST NAME</Text>
            <Text>apps.brekeke.com</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icon name="usb" type="MaterialIcons"/>
          </Left>
          <Body>
            <Text note>POST</Text>
            <Text>8443</Text>
          </Body>
        </ListItem>
      </List>
		)
	}
}

export default PbxComponent;
