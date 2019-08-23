import { Container } from 'native-base';
import React from 'react';

import SearchContact from '../components-Contacts/SearchContact';
import Headers from '../components-Home/Header';
import ListChats from './List-Chats';

class ChatsHome extends React.Component {
  render() {
    const p = this.props;
    return (
      <Container>
        <Headers title="Chats" />
        <SearchContact />
        <ListChats ids={p.buddyIds} byid={p.buddyById} select={p.selectBuddy} />
      </Container>
    );
  }
}

export default ChatsHome;
