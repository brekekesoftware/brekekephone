import { Container, Content } from 'native-base';
import React from 'react';

import Hearders from '../components-Home/Header';
import CallParkComponent from './CallPark';
import PBXComponent from './PBX';

class PageSettings extends React.Component {
  render() {
    return (
      <Container>
        <Hearders title="Settings" />
        <Content>
          <PBXComponent {...this.props} />
          <CallParkComponent {...this.props} />
        </Content>
      </Container>
    );
  }
}

export default PageSettings;
