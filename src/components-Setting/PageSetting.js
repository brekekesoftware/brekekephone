import { Container, Content } from 'native-base';
import React, { Component } from 'react';

import CallParkComponent from './CallPark';
import PbxComponent from './PBX';

class PageSetting extends Component {
  render() {
    return (
      <Container>
        <Content>
          <PbxComponent />
          <CallParkComponent />
        </Content>
      </Container>
    );
  }
}

export default PageSetting;
