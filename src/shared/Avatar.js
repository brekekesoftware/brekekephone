import { mdiRecord } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
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

const statusMapColor = {
  online: g.mainBg,
  idle: g.warning,
  busy: g.redDarkBg,
  offline: g.subColor,
};

const Avatar = observer(p => (
  <View style={[s.Avatar, p.style]}>
    <Image source={p.source} style={s.Avatar_Image} />
    <Icon
      color={statusMapColor[p.status]}
      path={mdiRecord}
      style={s.Avatar_Image__status}
    />
  </View>
));

export default Avatar;
