import React, { Component } from 'react';
import { Container, Header, Content, Footer, FooterTab, Button, Icon, Text, Badge } from 'native-base';
import {rem, std} from '../styleguide';

class FooterTabs extends Component {
  constructor(props) {
    super(props);
    
  }
  render() {
    return (
      <Footer>
        <FooterTab>
          <Button vertical onPress={this.props.pressContacts}>
            <Icon name="contacts" />
            <Text>CONTACTS</Text>
          </Button>
          <Button badge vertical>
            <Badge><Text>2</Text></Badge>
            <Icon name="call" />
            <Text>RECENTS</Text>
          </Button>
          <Button vertical>
            <Icon name="dialpad" />
            <Text>CALL</Text>
          </Button>
          <Button vertical>
            <Icon name="chat-bubble" />
            <Text>CHAT</Text>
          </Button>
          <Button vertical>
            <Icon name="settings" />
            <Text>SETTINGS</Text>
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

export default FooterTabs;
