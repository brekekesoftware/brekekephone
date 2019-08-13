import { Container } from 'native-base';
import React from 'react';

import DisplayNumber from './DisplayNumber';
import KeyPad from './KeyPad';

class PagePhoneCall extends React.Component {
  render() {
    const p = this.props;

    return (
      <Container>
        <DisplayNumber showNum={p.showNum} />
        <KeyPad onPress={p.onPress} callVoice={p.callVoice} />
      </Container>
    );
  }
}

export default PagePhoneCall;
