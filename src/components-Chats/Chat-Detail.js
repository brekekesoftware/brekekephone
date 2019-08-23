import { Container } from 'native-base';
import React from 'react';

import ChatMessages from './Chat-Messages';
import FooterChats from './Footer-Chats';
import HeaderChat from './Header-Chat';

class ChatsDetail extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <HeaderChat
          ibuddyName={p.buddyName}
          buddyId={p.buddyId}
          back={p.back}
        />
        <ChatMessages />
        <FooterChats />
      </Container>
    );
  }
}

export default ChatsDetail;
