import { mdiPlus } from '@mdi/js';
import { Button, Text, View } from 'native-base';
import React from 'react';

import registerStyle from './registerStyle';
import SvgIcon from './SvgIcon';

registerStyle(v => ({
  View: {
    AppHeader: {
      position: 'relative',
      overflow: 'hidden',
      padding: v.padding,
      paddingBottom: 3 * v.padding,
    },
  },
  Text: {
    AppHeader_Text: {
      fontWeight: 'bold',
      fontSize: 2 * v.fontSizeBase,
    },
    AppHeader_SubText: {
      fontSize: 0.8 * v.fontSizeBase,
      color: v.brekekeShade8,
    },
  },
  Button: {
    AppHeader_CreateBtn: {
      position: 'absolute',
      top: v.padding,
      right: v.padding / 3,
      width: 50,
      height: 50,
      borderRadius: 50,
      backgroundColor: v.brekekeDarkGreen,
      '.white': {
        backgroundColor: 'white',
      },
    },
  },
}));

const AppHeader = p => (
  <View AppHeader>
    <Text AppHeader_Text>{p.text}</Text>
    <Text AppHeader_SubText>{p.subText || ' '}</Text>
    {p.onCreateBtnPress && (
      <Button AppHeader_CreateBtn white={p.white} onPress={p.onCreateBtnPress}>
        <SvgIcon
          path={mdiPlus}
          width="100%"
          color={p.white ? 'black' : 'white'}
        />
      </Button>
    )}
  </View>
);

export default AppHeader;
