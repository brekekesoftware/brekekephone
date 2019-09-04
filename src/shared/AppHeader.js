import { mdiPlus } from '@mdi/js';
import { Button, Text, View } from 'native-base';
import React from 'react';

import SvgIcon from '../components-shared/SvgIcon';
import registerStyle from '../style/registerStyle';

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
      fontSize: '2em',
    },
    AppHeader_SubText: {
      fontSize: '0.7em',
      opacity: 0.7,
    },
  },
  Button: {
    AppHeader_CreateBtn: {
      position: 'absolute',
      top: v.padding,
      right: v.padding,
      borderRadius: '100%',
      backgroundColor: 'white',
      width: 50,
      height: 50,
    },
    AppHeader_CreateBtnGreen: {
      backgroundColor: v.brekekeGreen,
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
          flex="1"
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
