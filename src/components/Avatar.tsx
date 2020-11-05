import { mdiRecord } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import { Platform, StyleSheet, View, ViewProps } from 'react-native'
import { FastImageProps } from 'react-native-fast-image'

import avatarPlaceholder from '../assets/avatar-placeholder.png'
import authStore from '../stores/authStore'
import { RnIcon, RnImage } from './Rn'
import g from './variables'

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
})

const statusMapColor = {
  online: g.colors.primary,
  idle: g.colors.warning,
  busy: g.colors.danger,
  offline: g.subColor,
}

const Avatar = observer(
  (p: {
    source?: string | { uri: string }
    status?: string
    style?: ViewProps['style']
  }) => {
    const { source, status, style } = p
    const uri =
      (typeof source !== 'string' &&
        typeof source?.uri === 'string' &&
        source?.uri) ||
      (Platform.OS === 'web' && avatarPlaceholder) ||
      avatarPlaceholder
    const imgSource =
      typeof uri === 'string' ? { uri } : (uri as FastImageProps['source'])
    return (
      <View style={[css.Avatar, style]}>
        <View style={css.ImageOuter}>
          <RnImage source={imgSource} style={css.Image} />
        </View>
        {authStore.currentProfile.ucEnabled && typeof status === 'string' && (
          <RnIcon
            color={statusMapColor[status]}
            path={mdiRecord}
            style={css.Status}
          />
        )}
      </View>
    )
  },
)

export default Avatar
