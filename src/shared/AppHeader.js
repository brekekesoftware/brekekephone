import { mdiPlus } from '@mdi/js';
import { Button, Text, View } from 'native-base';
import React from 'react';

import SvgIcon from '../components-shared/SvgIcon';
import { registerStyle } from '../nativeBaseStyle';

registerStyle(v => ({
  'NativeBase.ViewNB': {
    '.AppHeader': {
      position: 'relative',
      overflow: 'hidden',
      padding: v.padding,
    },
  },
  'NativeBase.Text': {
    '.AppHeader_Text': {
      fontWeight: 'bold',
      fontSize: '2em',
    },
    '.AppHeader_SubText': {
      fontWeight: 'bold',
      fontSize: '0.8em',
      opacity: 0.7,
    },
  },
  'NativeBase.Button': {
    '.AppHeader_CreateBtn': {
      position: 'absolute',
      top: 15,
      right: v.padding,
      borderRadius: '100%',
      backgroundColor: 'white',
      width: 55,
      height: 55,
    },
  },
}));

const AppHeader = p => (
  <View AppHeader>
    <Text AppHeader_Text>{p.text}</Text>
    <Text AppHeader_SubText>{p.subText || ' '}</Text>
    <Button AppHeader_CreateBtn onPress={p.onCreateBtnPress}>
      <SvgIcon path={mdiPlus} flex="1" />
    </Button>
  </View>
);

export default AppHeader;
