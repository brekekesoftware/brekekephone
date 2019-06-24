import {
  Platform,
  View,
  StatusBar,
  StyleSheet,
} from 'react-native';
import React from "react";


const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const st = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
});



const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[st.statusBar, { backgroundColor }]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
);





export default MyStatusBar;


