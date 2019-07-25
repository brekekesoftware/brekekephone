import React, { Component } from 'react';
import { Container } from 'native-base';
import KeyPad from './KeyPad';
import DisplayNumber from './DisplayNumber';

class PagePhoneCall extends Component {
	render() {
		return (
      <Container>
          <DisplayNumber/>
          <KeyPad/>
      </Container>
		)
	}
}

export default PagePhoneCall;
