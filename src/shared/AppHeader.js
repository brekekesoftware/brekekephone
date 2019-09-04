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
    },
  },
  Text: {
    AppHeader_Text: {
      fontWeight: 'bold',
      fontSize: 2.5 * v.fontSizeBase,
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
      right: v.padding,
      borderRadius: 100,
      backgroundColor: 'white',
      width: 50,
      height: 50,
    },
    AppHeader_CreateBtnGreen: {
      backgroundColor: v.brekekeDarkGreen,
    },
  },
}));

const AppHeader = p => (
  <View AppHeader>
    <Text AppHeader_Text>{p.text}</Text>
    <Text AppHeader_SubText>{p.subText || ' '}</Text>
    {p.onCreateBtnPress && (
      <Button
        AppHeader_CreateBtn
        AppHeader_CreateBtnGreen={p.createBtnGreen}
        onPress={p.onCreateBtnPress}
      >
        <SvgIcon
          path={mdiPlus}
          width="100%"
          color={p.createBtnGreen ? 'white' : 'black'}
        />
      </Button>
    )}
  </View>
);

AppHeader.defaultProps = {
  createBtnGreen: true,
};

export default AppHeader;
