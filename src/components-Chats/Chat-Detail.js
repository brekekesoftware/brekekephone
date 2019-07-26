import React, { Component } from 'react';
import { Container } from 'native-base';
import HeaderChat from './Header-Chat';
import ChatMessages from './Chat-Messages';
import FooterChats from './Footer-Chats';

class ChatsDetail extends Component {
	render() {
		return (
      <Container>
      	<HeaderChat/>
      	<ChatMessages/>
      	<FooterChats/>
      </Container>
		)
	}
}

export default ChatsDetail;
