import { mdiKeyboardBackspace, mdiPlus } from '@mdi/js';
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
      '.hasBackBtn': {
        paddingLeft: 55,
      },
    },
  },
  Text: {
    AppHeader_Text: {
      fontWeight: 'bold',
      fontSize: 1.7 * v.fontSizeBase,
    },
    AppHeader_SubText: {
      fontSize: 0.9 * v.fontSizeBase,
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
      '.createBtnWhite': {
        backgroundColor: 'white',
      },
    },
    AppHeader_BackBtn: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 50,
      height: 70,
      paddingHorizontal: 0,
      paddingVertical: 20,
      borderRadius: 0,
    },
  },
}));

const AppHeader = p => (
  <View AppHeader hasBackBtn={!!p.onBackBtnPress}>
    <Text AppHeader_Text>{p.text}</Text>
    <Text AppHeader_SubText>{p.subText || ' '}</Text>
    {p.onCreateBtnPress && (
      <Button
        AppHeader_CreateBtn
        createBtnWhite={p.createBtnWhite}
        onPress={p.onCreateBtnPress}
      >
        <SvgIcon
          path={mdiPlus}
          width="100%"
          color={p.createBtnWhite ? 'black' : 'white'}
        />
      </Button>
    )}
    {p.onBackBtnPress && (
      <Button AppHeader_BackBtn onPress={p.onBackBtnPress}>
        <SvgIcon path={mdiKeyboardBackspace} width="100%" />
      </Button>
    )}
  </View>
);

export default AppHeader;
