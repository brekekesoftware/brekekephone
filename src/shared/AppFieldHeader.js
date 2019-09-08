import { Text, View } from 'native-base';
import React from 'react';

import registerStyle from './registerStyle';

registerStyle(v => ({
  View: {
    AppFieldHeader: {
      backgroundColor: v.brekekeShade3,
      padding: v.padding,
      marginHorizontal: -v.padding,
      '.hasMargin': {
        marginTop: 2 * v.padding,
      },
    },
  },
  Text: {
    AppFieldHeader_Txt: {
      fontWeight: 'bold',
      fontSize: 0.8 * v.fontSizeBase,
    },
  },
}));

const AppFieldHeader = p => (
  <View AppFieldHeader hasMargin={p.hasMargin}>
    <Text AppFieldHeader_Txt>{p.text}</Text>
  </View>
);

export default AppFieldHeader;
