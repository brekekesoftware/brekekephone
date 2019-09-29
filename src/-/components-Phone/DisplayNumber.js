import { Button, H2, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  containerDisplay: {
    height: `30%`,
  },

  containerBtn: {
    flexDirection: `row`,
    justifyContent: `flex-end`,
    padding: std.gap.lg,
  },

  shownumber: {
    marginTop: std.gap.lg,
    flexDirection: `column`,
    justifyContent: `flex-end`,
  },

  btnCall: {
    marginRight: std.gap.md,
  },

  textH2: {
    padding: std.gap.lg,
  },
  showNum: {
    textAlign: `center`,
    fontSize: 35,
  },
});

class DisplayNumber extends React.Component {
  render() {
    const p = this.props;

    return (
      <View style={st.containerDisplay}>
        <View style={st.containerBtn}>
          <Button style={st.btnCall} small success>
            <Text>CALL PARK (1)</Text>
          </Button>
          <Button style={st.btnCall} small success>
            <Text>VOICEMAIL (2)</Text>
          </Button>
        </View>
        <View style={st.shownumber}>
          <H2 style={st.textH2}>Your number</H2>
          <Text style={st.showNum}>{p.showNum}</Text>
        </View>
      </View>
    );
  }
}

export default DisplayNumber;
