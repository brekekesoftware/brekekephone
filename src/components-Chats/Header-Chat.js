import React from 'react';
import { Header, Left, Body, Right, Text,Button, Icon, View } from 'native-base';
import {StyleSheet} from 'react-native';

const st = StyleSheet.create({
  container:{
    height: 60,
  },
  available: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  }
})


class HeaderChat extends React.Component {

  render() {
    return (
  		<Header style={st.container}>
  			<Left>
          <Button transparent dark>
            <Icon name="arrow-back" type="MaterialIcons"/>
          </Button>
  			</Left>
        <Body>
          <Text>Aerald Richards</Text>
          <View style={st.available}>
            <Icon name="fiber-manual-record" type="MaterialIcons"/> 
            <Text note>available</Text>
          </View>
        </Body>
        <Right>
          <Button  transparent dark>
            <Icon name="search" type="MaterialIcons"/>
          </Button>
          <Button transparent dark>
            <Icon name="call" type="MaterialIcons"/>
          </Button>
        </Right>
  		</Header>
    );
  }
}

export default HeaderChat;
