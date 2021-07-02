import { mdiImageBrokenVariant } from '@mdi/js'
import React, { FC, useCallback } from 'react'
import { ActivityIndicator, StyleSheet, View, ViewProps } from 'react-native'
import FastImage from 'react-native-fast-image'
import Svg, { Path } from 'react-native-svg'

import { ChatFile } from '../stores/chatStore'
import RnTouchableOpacity from './RnTouchableOpacity'
import g from './variables'

const css = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: g.layerBg,
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  imageBroken: {
    marginLeft: 0,
    marginTop: 0,
    backgroundColor: 'blue',
    aspectRatio: 1,
    alignItems: 'center',
    width: '100%',
    height: 150,
  },
})
const size = '100%'

const RnImageLoader: FC<ViewProps & ChatFile> = ({ url, state }) => {
  const onShowImage = useCallback(() => {
    const image = new Image()
    image.src = url || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [url])

  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && url

  return (
    <View style={css.image}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={css.loading} />
      )}
      {isLoadSuccess && (
        <RnTouchableOpacity onPress={onShowImage}>
          <FastImage source={{ uri: url }} style={css.image} />
        </RnTouchableOpacity>
      )}
      {isLoadFailed && (
        <Svg
          preserveAspectRatio='xMinYMin slice'
          height={size}
          viewBox='3 3  18 18'
          width={size}
        >
          <Path d={mdiImageBrokenVariant} fill={g.colors.greyTextChat} />
        </Svg>
      )}
    </View>
  )
}

export default RnImageLoader
