import { Container } from 'native-base';
import React from 'react';

import PageInComingCall from '../components-Incoming/PageInComingCall';

class HomePage extends React.Component {
  render() {
    return (
      <Container>
        <PageInComingCall />
      </Container>
    );
  }
}

export default HomePage;
