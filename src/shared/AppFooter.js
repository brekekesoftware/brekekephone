import { View } from 'native-base';
import React from 'react';

import AppFooterButtons from './AppFooterButtons';
import registerStyle from './registerStyle';

registerStyle(v => ({
  View: {
    AppFooter: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'block',
      paddingVertical: v.padding / 2,
      paddingHorizontal: v.padding,
      backgroundColor: 'white',
    },
    AppFooter_Btns: {
      display: 'block',
      flexDirection: 'row',
      minWidth: 260,
      maxWidth: 380,
      marginHorizontal: 'auto',
    },
  },
}));

const AppFooter = ({ style, ...p }) => (
  <View AppFooter style={style}>
    <View AppFooter_Btns>
      <AppFooterButtons {...p} />
    </View>
  </View>
);

export default AppFooter;
