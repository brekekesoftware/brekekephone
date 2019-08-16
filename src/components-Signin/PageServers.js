import { Container } from 'native-base';
import React from 'react';

import ServerForm from './ServerForm';

class PageServers extends React.Component {
  render() {
    return (
      <Container>
        <ServerForm {...this.props} />
      </Container>
    );
  }
}

export default PageServers;
