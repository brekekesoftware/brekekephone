import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import ImageView from 'react-native-image-viewing'

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
  console.log({ state, url })

  const [visible, setIsVisible] = useState(false)
  const images = [{ uri: url }]

  const onShowImage = useCallback(() => {
    images.length > 0 && setIsVisible(true)
  }, [images])

  return (
    <View style={css.Image}>
      {state !== 'success' && (
        <ActivityIndicator size='small' color='white' style={css.Loading} />
      )}
      <RnTouchableOpacity onPress={onShowImage}>
        <RnImage source={{ uri: url }} style={css.Image} />
      </RnTouchableOpacity>
      <ImageView
        images={images}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </View>
  )
}

export default RnImageLoader
