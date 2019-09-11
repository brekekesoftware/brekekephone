import { mdiCached, mdiKeyboardBackspace } from '@mdi/js';
import { Button, Text, View } from 'native-base';
import { transparentize } from 'polished';
import React from 'react';

import registerStyle from '../style/registerStyle';
import v from '../style/variables';
import SvgIcon from './SvgIcon';

registerStyle(v => ({
  View: {
    AppFooterButtons: {
      display: 'flex',
      flexDirection: 'row',
      borderRadius: v.brekekeBorderRadius,
      overflow: 'hidden',
    },
  },
  Text: {
    AppFooterButtons_BtnTxt: {
      flex: 1,
      fontWeight: 'bold',
      textAlign: 'center',
      color: 'white',
    },
  },
  Button: {
    AppFooterButtons_Btn: {
      borderRadius: 0,
      width: '25%',
      '.back': {
        backgroundColor: transparentize(0.9, v.brekekeDanger),
      },
      '.reset': {
        backgroundColor: v.brekekeShade2,
      },
      '.save': {
        width: '50%',
        backgroundColor: v.brekekeDarkGreen,
      },
    },
  },
}));

const AppFooterButtons = p => (
  <View AppFooterButtons>
    <Button AppFooterButtons_Btn back onPress={p.onBackBtnPress}>
      <SvgIcon
        path={p.backIcon || mdiKeyboardBackspace}
        width="100%"
        color={v.brekekeDanger}
      />
    </Button>
    <Button AppFooterButtons_Btn reset onPress={p.onResetBtnPress}>
      <SvgIcon path={p.resetIcon || mdiCached} width="100%" />
    </Button>
    <Button AppFooterButtons_Btn save onPress={p.onSaveBtnPress}>
      <Text uppercase={false} AppFooterButtons_BtnTxt>
        {p.saveText || 'SAVE'}
      </Text>
    </Button>
  </View>
);

export default AppFooterButtons;
