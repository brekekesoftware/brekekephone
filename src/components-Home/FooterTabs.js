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

import { rem, std } from '../styleguide';

class FooterTabs extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Footer>
        <FooterTab>
          <Button vertical onPress={this.props.pressContacts}>
            <Icon name="book" />
            <Text>CONTACTS</Text>
          </Button>
          <Button badge vertical>
            <Badge>
              <Text>2</Text>
            </Badge>
            <Icon name="call" />
            <Text>RECENTS</Text>
          </Button>
          <Button vertical>
            <Icon name="keypad" />
            <Text>CALL</Text>
          </Button>
          <Button vertical>
            <Icon name="chatbubbles" />
            <Text>CHAT</Text>
          </Button>
          <Button vertical>
            <Icon name="cog" />
            <Text>SETTINGS</Text>
          </Button>
        </FooterTab>
      </Footer>
    );
  }
}

export default FooterTabs;
