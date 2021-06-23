import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'

import { ChatFile } from '../stores/chatStore'
import { RnImage } from './Rn'
import RnTouchableOpacity from './RnTouchableOpacity'

const css = StyleSheet.create({
  Image: {
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  Loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00000090',
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
})

const RnImageLoader: FC<ViewProps & ChatFile> = ({ url, state }) => {
  const onShowImage = useCallback(() => {
    console.log({ url })
    // window.open(url, '_blank')
    const win = window.open('')
    win?.document.write(
      '<iframe src="' +
        url +
        '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:70%; height:70%;" allowfullscreen></iframe>',
    )
  }, [url])

  return (
    <View style={css.Image}>
      {state !== 'success' && (
        <ActivityIndicator size='small' color='white' style={css.Loading} />
      )}
      <RnTouchableOpacity onPress={onShowImage}>
        <RnImage source={{ uri: url }} style={css.Image} />
      </RnTouchableOpacity>
    </View>
  )
}

export default RnImageLoader
