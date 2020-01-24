import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from '../-/Rn';
import sip from '../api/sip';
import g from '../global';
import Layout from '../shared/Layout';

const css = StyleSheet.create({
  KeyPad_Number: {
    flexDirection: `row`,
  },
  KeyPad_NumberTxt: {
    fontSize: g.fontSizeTitle,
    fontWeight: `600`,
    textAlign: `center`,
    paddingVertical: 20,
  },
  KeyPad_NumberBtn: {
    width: `33.3%`,
  },
  KeyPad_Btn: {
    flexDirection: `row`,
    justifyContent: `space-between`,
  },
  KeyPad_Btn__call: {
    backgroundColor: g.colors.primary,
    width: 64,
    borderRadius: 40,
    paddingVertical: 20,
  },
});

const keys = [
  [`1`, `2`, `3`],
  [`4`, `5`, `6`],
  [`7`, `8`, `9`],
  [`*`, `0`, `#`],
];

class PageDtmfKeypad extends React.Component {
  render() {
    return (
      <Layout compact onBack={g.backToPageCallManage} title="Send DTMF">
        {keys.map((row, i) => (
          <View key={i} style={css.KeyPad_Number}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                onPress={() => this.sendKey(key)}
                style={css.KeyPad_NumberBtn}
              >
                <Text style={css.KeyPad_NumberTxt}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </Layout>
    );
  }

  sendKey = key => {
    sip.sendDTMF(key, this.props.callId);
  };
}

export default PageDtmfKeypad;
