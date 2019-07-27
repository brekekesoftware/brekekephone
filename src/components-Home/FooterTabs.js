import {
  Badge,
  Button,
  Container,
  Content,
  Footer,
  FooterTab,
  Header,
  Icon,
  Text,
} from 'native-base';
import React, { Component } from 'react';

class FooterTabs extends Component {
  render() {
    return (
      <Footer
        style={{
          paddingBottom: 0,
        }}
      >
        <FooterTab>
          <Button vertical onPress={this.props.pressContacts}>
            <Icon name="contacts" type="MaterialIcons" />
            <Text>CONTACTS</Text>
          </Button>
          <Button badge vertical>
            <Badge>
              <Text>2</Text>
            </Badge>
            <Icon name="call" type="MaterialIcons" />
            <Text>RECENTS</Text>
          </Button>
          <Button vertical>
            <Icon name="dialpad" type="MaterialIcons" />
            <Text>CALL</Text>
          </Button>
          <Button vertical>
            <Icon name="chat" type="MaterialIcons" />
            <Text>CHAT</Text>
          </Button>
          <Button vertical>
            <Icon name="settings" type="MaterialIcons" />
            <Text>SETTINGS</Text>
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

export default FooterTabs;
