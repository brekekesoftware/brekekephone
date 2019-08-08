import { Container } from 'native-base';
import React from 'react';

import ListChats from './List-Chats';
import Headers from '../components-Home/Header';

class ChatsHome extends React.Component {
  render() {
    return (
      <Container>
      	<Headers title="Chats"/>
        <ListChats />
      </Container>
    );
  }
}

export default ChatsHome;
