import { Container, Content } from 'native-base';
import React from 'react';

import Hearders from '../components-Home/Header';
import CallParkComponent from './CallPark';
import PbxComponent from './PBX';

class PageSettings extends React.Component {
  render() {
    return (
      <Container>
        <Hearders title="Settings" />
        <Content>
          <PbxComponent {...this.props} />
          <CallParkComponent />
        </Content>
      </Container>
    );
  }
}

export default PageSettings;
