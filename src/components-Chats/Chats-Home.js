import { Container } from 'native-base';
import React, { Component } from 'react';

import ListChats from './List-Chats';

class ChatsHome extends Component {
  render() {
    return (
      <Container>
        <ListChats />
      </Container>
    );
  }
}

export default ChatsHome;
