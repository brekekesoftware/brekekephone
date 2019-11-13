import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';

const st = StyleSheet.create({
  main: {
    flex: 1,
    paddingBottom: getBottomSpace(),
  },
});

class WithoutStatusBar extends React.Component {
  render() {
    return <View style={st.main}>{this.props.children}</View>;
  }
}

export default WithoutStatusBar;
