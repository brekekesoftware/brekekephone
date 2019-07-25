import React from 'react';
import { Header, H1, Left, Right, Text,Button } from 'native-base';


class Headers extends React.Component {

  render() {
    return (
  		<Header noLeft>
  			<Left>
  				<H1>{this.props.title}</H1>
  			</Left>
        <Right>
          <Button  transparent dark>
            <Text >NEW</Text>
          </Button>
        </Right>
  		</Header>
    );
  }
}

export default Headers;
