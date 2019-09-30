import { mdiPhoneHangup } from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, Text, View } from '../native/Rn';
import ButtonIcon from '../shared/ButtonIcon';
import Layout from '../shared/Layout';
import v from '../variables';

const s = StyleSheet.create({
  Calling_Txt: {
    position: 'absolute',
    left: 20,
    top: 70,
  },
  Calling_Txt__Name: {
    fontSize: v.fontSizeTitle,
  },
  Calling_Btn__Hangup: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

class PageCalling extends React.Component {
  render() {
    return (
      <Layout
        header={{
          onBackBtnPress: g.goToCallsRecent,
        }}
      >
        <View style={s.Calling_Txt}>
          <Text style={s.Calling_Txt__Name}>Duan Huynh</Text>
          <Text>00:05</Text>
        </View>
        <View style={s.Calling_Btn__Hangup}>
          <ButtonIcon size={40} path={mdiPhoneHangup} name="HANG UP" />
        </View>
      </Layout>
    );
  }
}

export default PageCalling;
