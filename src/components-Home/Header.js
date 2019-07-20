import { Body, Container, H1, Header, Left } from 'native-base';
import React from 'react';

import FooterTabs from './FooterTabs';

class Headers extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Header noLeft>
        <Left>
          <H1>{this.props.title}</H1>
        </Left>
      </Header>
    );
  }
}

export default Headers;
