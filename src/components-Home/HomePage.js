import { Container } from 'native-base';
import React from 'react';

import ChatsDetail from '../components-Chats/Chat-Detail';

class HomePage extends React.Component {
  render() {
    return (
      <Container>
        <ChatsDetail />
      </Container>
    );
  }
}

export default HomePage;
