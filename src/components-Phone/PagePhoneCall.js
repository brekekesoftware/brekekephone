import { Container } from 'native-base';
import React, { Component } from 'react';

import DisplayNumber from './DisplayNumber';
import KeyPad from './KeyPad';

class PagePhoneCall extends Component {
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
