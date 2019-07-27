import { Button, H1, Header, Left, Right, Text } from 'native-base';
import React from 'react';

class Headers extends React.Component {
  render() {
    return (
      <Header noLeft>
        <Left>
          <H1>{this.props.title}</H1>
        </Left>
        <Right>
          <Button transparent dark>
            <Text>NEW</Text>
          </Button>
        </Right>
      </Header>
    );
  }
}

export default Headers;
