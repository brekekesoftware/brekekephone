import React, { Component } from 'react';
import { Container, Content, Header, View, Left, Right, H2, Body, Icon, Button, Text } from 'native-base';
import {StyleSheet} from 'react-native';
import { std } from '../styleguide';
import HangUpComponent from './HangUp';
import CallBar from './CallBar';

const st = StyleSheet.create({
  containerDisplay: {
    height: '20%',
  },
  containerName: {
    padding: std.gap.lg,
  },
  contaiHangUp:{
  	top: '10%',
  }
});

// Todo: background.

class PageInComingCall extends Component {
	render() {
		return (
      <Container>
        <Header transparent>
          <Left>
            <Button transparent dark>
              <Icon name='arrow-round-back' />
            </Button>
          </Left>
          <Right>
            <Button transparent dark>
              <Icon name='contacts' />
            </Button>
          </Right>
        </Header>
        <View style={st.containerName}>
        	<H2>Aerald Richards</H2>
        	<Button small success  >
        		<Text>VOICE CALLING</Text>
        	</Button>
        </View>
        <View>
          <CallBar/>
        </View>
        <View style={st.contaiHangUp}>
        	<HangUpComponent/>
        </View>
      </Container>
		)
	}
}

export default PageInComingCall;
