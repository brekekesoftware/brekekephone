import React, { Component } from 'react';
import { Container, Content } from 'native-base';
import PbxComponent from './PBX';
import CallParkComponent from './CallPark';

class PageSetting extends Component {
	render() {
		return (
      <Container>
        <Content>
          <PbxComponent/>
          <CallParkComponent/>
        </Content>
      </Container>
		)
	}
}

export default PageSetting;
