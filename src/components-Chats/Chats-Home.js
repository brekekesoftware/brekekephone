import { Container } from 'native-base';
import React from 'react';

import ListChats from './List-Chats';

class ChatsHome extends React.Component {
  render() {
    return (
      <Container>
        <ListChats />
      </Container>
    );
  }
}

export default ChatsHome;
