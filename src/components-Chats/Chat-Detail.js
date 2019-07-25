import React, { Component } from 'react';
import { Container } from 'native-base';
import HeaderChat from './Header-Chat';
import ChatMessages from './Chat-Messages';

class ChatsDetail extends Component {
	render() {
		return (
      <Container>
      	<HeaderChat/>
      	<ChatMessages/>
      </Container>
		)
	}
}

export default ChatsDetail;
