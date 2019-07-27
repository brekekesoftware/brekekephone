import { Container } from 'native-base';
import React, { Component } from 'react';

import ChatMessages from './Chat-Messages';
import FooterChats from './Footer-Chats';
import HeaderChat from './Header-Chat';

class ChatsDetail extends Component {
  render() {
    return (
      <Container>
        <HeaderChat />
        <ChatMessages />
        <FooterChats />
      </Container>
    );
  }
}

export default ChatsDetail;
