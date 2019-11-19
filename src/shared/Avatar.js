import { mdiRecord } from '@mdi/js';
import React from 'react';

import { Image, StyleSheet, View } from '../native/Rn';
import Icon from './Icon';

const s = StyleSheet.create({
  Avatar: {
    flexDirection: `row`,
  },
  Avatar_Image: {
    width: 50,
    height: 50,
    top: 13,
    borderRadius: 25,
  },
  Avatar_Image__status: {
    position: `absolute`,
    top: 40,
    left: 30,
  },
});

const Avatar = p => (
  <View style={[s.Avatar, p.style]}>
    <Image source={p.source} style={s.Avatar_Image} />
    {(p.chatOnline || p.status === `online`) && (
      <Icon color="#74bf53" path={mdiRecord} style={s.Avatar_Image__status} />
    )}
    {(p.chatOffline || p.status === `offline`) && (
      <Icon color="#8a8a8f" path={mdiRecord} style={s.Avatar_Image__status} />
    )}
    {(p.chatBusy || p.status === `busy`) && (
      <Icon color="#FF2D55" path={mdiRecord} style={s.Avatar_Image__status} />
    )}
  </View>
);

export default Avatar;
