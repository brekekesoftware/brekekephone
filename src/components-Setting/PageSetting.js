import { Container, Content } from 'native-base';
import React, { Component } from 'react';

import Hearders from '../components-Home/Header';
import CallParkComponent from './CallPark';
import PbxComponent from './PBX';

class PageSetting extends Component {
  render() {
    return (
      <Container>
        <Hearders title="Setting" />
        <Content>
          <PbxComponent {...this.props} />
          <CallParkComponent />
        </Content>
      </Container>
    );
  }
}

export default PageSetting;
