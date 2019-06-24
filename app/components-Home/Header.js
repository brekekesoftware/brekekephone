import React from 'react';
import FooterTabs from './FooterTabs';
import { Container, Header, H1, Left, Body } from 'native-base';


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
