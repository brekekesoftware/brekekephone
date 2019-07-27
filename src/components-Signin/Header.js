import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity as Button,
  View,
} from 'react-native';

import { rem, std } from '../styleguide';

const st = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },

  btnNewServer: {
    flexDirection: 'row-reverse',
    padding: std.gap.lg,
  },

  btnTextTitle: {
    padding: std.gap.lg,
    fontSize: std.textSize.md,

    color: Platform.select({
      ios: std.color.shade0,
      android: std.color.shade0,
      web: std.color.shade9,
    }),
  },

  containerTitle: {
    padding: std.gap.lg,
  },

  textTitle: {
    fontSize: std.textSize.lg + std.gap.md,
    lineHeight: std.iconSize.md + std.gap.md * 2,
    paddingBottom: std.gap.sm,

    color: Platform.select({
      ios: std.color.shade0,
      android: std.color.shade0,
      web: std.color.shade9,
    }),

    fontWeight: '700',
  },

  textCountServer: {
    fontSize: std.textSize.sm,

    color: Platform.select({
      ios: std.color.shade0,
      android: std.color.shade0,
      web: std.color.shade9,
    }),
  },
});

class Header extends React.Component {
  render() {
    return (
      <View style={st.container}>
        <View style={st.btnNewServer}>
          <Button>
            <Text style={st.btnTextTitle}>New</Text>
          </Button>
        </View>
        <View style={st.containerTitle}>
          <Text style={st.textTitle}>Servers</Text>
          <Text style={st.textCountServer}>0 SERVER IN TOTAL</Text>
        </View>
      </View>
    );
  }
}

export default Header;
