import { Container } from 'native-base';
import React from 'react';

import Headers from '../components-Home/Header';
import ListChats from './List-Chats';

class ChatsHome extends React.Component {
  render() {
    return (
      <Container>
        <Headers title="Chats" />
        <ListChats />
      </Container>
    );
  }
}

export default ChatsHome;
