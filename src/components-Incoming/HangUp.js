import React, { Component } from 'react';
import { Button, Text, Icon, View} from 'native-base';
import {StyleSheet,} from 'react-native';
import { std } from '../styleguide';

const st = StyleSheet.create({
  containerHangUp:{
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btnHangUp: {
    justifyContent: 'center',
    borderRadius: std.iconSize.md *2,
    width: std.iconSize.md * 3,
    height: std.iconSize.md * 3,
  },
  iconHangup:{
    fontWeight: '700',
    paddingTop: std.gap.md,
  }
});


class HangUpComponent extends Component {
	render() {
		return (
      <View style={st.containerHangUp}>
        <View style={st.conHangUp}>
          <Button style={st.btnHangUp} danger >
            <Icon name="call-end" type="MaterialIcons"/>
          </Button>
          <Text style={st.iconHangup}>HANG UP</Text>
        </View>
      </View>
		)
	}
}

export default HangUpComponent;
