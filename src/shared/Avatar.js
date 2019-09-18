import { mdiRecord } from '@mdi/js';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import FastImage from '../native/FastImage';
import Icon from './Icon';

const s = StyleSheet.create({
  Image: {
    width: 50,
    height: 50,
    top: 13,
    borderRadius: 25,
  },
  Image__status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

const Avatar = p => (
  <View>
    <FastImage style={s.Image} source={p.source} />
    {p.status === 'online' && (
      <View style={s.Image__status}>
        <Icon path={mdiRecord} color="#74bf53" />
      </View>
    )}
    {p.status === 'offline' && (
      <View style={s.Image__status}>
        <Icon path={mdiRecord} color="#8a8a8f" />
      </View>
    )}
    {p.status === 'busy' && (
      <View style={s.Image__status}>
        <Icon path={mdiRecord} color="#FF2D55" />
      </View>
    )}
  </View>
);

export default Avatar;
