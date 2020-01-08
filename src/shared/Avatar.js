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
  online: g.colors.primary,
  idle: g.colors.warning,
  busy: g.colors.danger,
  offline: g.subColor,
};

const Avatar = observer(({ source, status, style }) => {
  const uri =
    (typeof source?.uri === `string` && source?.uri) ||
    (Platform.OS === `web` && avatarPlaceholder);
  return (
    <View style={[css.Avatar, style]}>
      <Image
        source={uri ? { uri } : avatarPlaceholder}
        style={css.Avatar_Image}
      />
      {authStore.currentProfile?.ucEnabled && typeof status === `string` && (
        <Icon
          color={statusMapColor[status]}
          path={mdiRecord}
          style={css.Avatar_Image__status}
        />
      )}
    </View>
  );
});

export default Avatar;
