import React, { Component } from 'react';
import { ListItem, Left, Button, Icon, Body, Text, List  } from 'native-base';

class PbxComponent extends Component {
	render() {
		return (
      <List>
        <ListItem itemDivider>
            <Text>PBX</Text>
          </ListItem>       
        <ListItem thumbnail noBorder>
          <Left>
            <Icon active name="person" />
          </Left>
          <Body>
            <Text note>USERNAME</Text>
            <Text>401</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icon active name="home" />
          </Left>
          <Body>
            <Text note>TENANT</Text>
            <Text>Nam</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icon active name="desktop" />
          </Left>
          <Body>
            <Text note>HOST NAME</Text>
            <Text>apps.brekeke.com</Text>
          </Body>
        </ListItem>
        <ListItem thumbnail noBorder>
          <Left>
            <Icon active name="git-network" />
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
