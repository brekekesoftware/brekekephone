import { Button, Icon, Text, View } from 'native-base';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import { std } from '../styleguide';

const st = StyleSheet.create({
  containerCallbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: std.iconSize.lg * 2,
    marginLeft: std.gap.lg,
    marginRight: std.gap.lg,
  },

  conbtnHangUp: {
    alignItems: 'center',
    marginHorizontal: std.gap.lg,
  },

  btnCallBar: {
    justifyContent: 'center',
    borderRadius: std.iconSize.md * 2,
    width: std.iconSize.md * 3,
    height: std.iconSize.md * 3,
  },

  textCallBar: {
    paddingTop: std.gap.md,
    fontSize: std.textSize.sm,
  },
});

class CallBar extends Component {
  render() {
    return (
      <View>
        <View style={st.containerCallbar}>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="call-split" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>TRANSFER</Text>
          </View>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="local-parking" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>PARK</Text>
          </View>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="video-call" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>VIDEO</Text>
          </View>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="volume-up" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>MUTE</Text>
          </View>
        </View>
        <View style={st.containerCallbar}>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="fiber-manual-record" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>RECORDING</Text>
          </View>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="dialpad" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>KEYPAD</Text>
          </View>
          <View style={st.conbtnHangUp}>
            <Button transparent dark bordered style={st.btnCallBar}>
              <Icon name="pause" type="MaterialIcons" />
            </Button>
            <Text style={st.textCallBar}>HOLD</Text>
          </View>
        </View>
      </View>
    );
  }
}

export default CallBar;
