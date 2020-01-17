import { mdiRecord } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import { Icon, Image, Platform, StyleSheet, View } from '../-/Rn';
import avatarPlaceholder from '../assets/avatar-placeholder.png';
import g from '../global';
import authStore from '../global/authStore';

const css = StyleSheet.create({
  Avatar: {
    flexDirection: `row`,
  },
  Image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  Status: {
    position: `absolute`,
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
    (typeof source?.uri === `string` && source?.uri) ||
    (Platform.OS === `web` && avatarPlaceholder);
  const imgSource = uri ? { uri } : avatarPlaceholder;
  return (
    <View style={[css.Avatar, style]}>
      <Image source={imgSource} style={css.Image} />
      {authStore.currentProfile?.ucEnabled && typeof status === `string` && (
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
