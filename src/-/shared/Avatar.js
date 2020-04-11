import { mdiRecord } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import avatarPlaceholder from '../../assets/avatar-placeholder.png';
import g from '../global';
import authStore from '../global/authStore';
import { Icon, Image, Platform, StyleSheet, View } from '../Rn';

const css = StyleSheet.create({
  Avatar: {
    width: 50,
    height: 50,
  },
  ImageOuter: {
    flex: 1,
    borderRadius: 50,
    overflow: 'hidden',
  },
  Image: {
    flex: 1,
  },
  Status: {
    position: 'absolute',
    top: 27,
    left: 30,
  },
});

const statusMapColor = {
  online: g.colors.primary,
  idle: g.colors.warning,
  busy: g.colors.danger,
  offline: g.subColor,
};

const Avatar = observer(({ source, status, style }) => {
  const uri =
    (typeof source?.uri === 'string' && source?.uri) ||
    (Platform.OS === 'web' && avatarPlaceholder);
  const imgSource = uri ? { uri } : avatarPlaceholder;
  return (
    <View style={[css.Avatar, style]}>
      <View style={css.ImageOuter}>
        <Image source={imgSource} style={css.Image} />
      </View>
      {authStore.currentProfile.ucEnabled && typeof status === 'string' && (
        <Icon
          color={statusMapColor[status]}
          path={mdiRecord}
          style={css.Status}
        />
      )}
    </View>
  );
});

export default Avatar;
