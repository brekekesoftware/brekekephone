import { View } from 'native-base';
import React from 'react';

import registerStyle from '../---style/registerStyle';

registerStyle(v => ({
  View: {
    AppBody: {
      padding: v.padding,
    },
    AppBody_Footer: {
      height: 60,
    },
  },
}));

const AppBody = p => (
  <View AppBody>
    {p.children}
    {p.hasFooter && <View AppBody_Footer />}
  </View>
);

export default AppBody;
