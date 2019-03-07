import React from 'react';
import { StyleSheet, View } from 'react-native';

const st = StyleSheet.create({
  main: {
    flex: 1,
    position: 'relative',
  },
});

class WithoutStatusBar extends React.Component {
  render() {
    return <View style={st.main}>{this.props.children}</View>;
  }
}

export default WithoutStatusBar;
