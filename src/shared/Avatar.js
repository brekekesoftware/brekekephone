import { mdiRecord } from '@mdi/js';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import FastImage from '../native/FastImage';
import Icon from './Icon';

const s = StyleSheet.create({
  Avatar: {
    flexDirection: 'row',
  },
  Avatar_Image: {
    width: 50,
    height: 50,
    top: 13,
    borderRadius: 25,
  },
  Avatar_Image__status: {
    position: 'absolute',
    top: 40,
    left: 30,
  },
});

const Avatar = p => (
  <View style={s.Avatar}>
    <FastImage style={s.Avatar_Image} source={p.source} />
    {(p.chatOnline || p.status === 'online') && (
      <Icon style={s.Avatar_Image__status} path={mdiRecord} color="#74bf53" />
    )}
    {(p.chatOffline || p.status === 'offline') && (
      <Icon style={s.Avatar_Image__status} path={mdiRecord} color="#8a8a8f" />
    )}
    {(p.chatBusy || p.status === 'busy') && (
      <Icon style={s.Avatar_Image__status} path={mdiRecord} color="#FF2D55" />
    )}
  </View>
);

export default Avatar;
