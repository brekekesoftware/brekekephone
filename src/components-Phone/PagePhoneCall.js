import { Container } from 'native-base';
import React from 'react';

import DisplayNumber from './DisplayNumber';
import KeyPad from './KeyPad';

class PagePhoneCall extends React.Component {
  render() {
    return (
      <Container>
        <DisplayNumber />
        <KeyPad />
      </Container>
    );
  }
}

export default PagePhoneCall;
