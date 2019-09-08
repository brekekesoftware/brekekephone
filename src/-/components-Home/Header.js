import { H1, Header, Left } from 'native-base';
import React from 'react';

class Headers extends React.Component {
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
