import React from 'react';
import FooterTabs from './FooterTabs';
import { Container, Header, H1, Left, Body, Right, Text,Button } from 'native-base';


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
