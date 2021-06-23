import {
  mdiAlphaPCircle,
  mdiFileImage,
  mdiFileImageOutline,
  mdiImageBroken,
  mdiImageBrokenVariant,
} from '@mdi/js'
import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import ImageView from 'react-native-image-viewing'
import Svg, { Path } from 'react-native-svg'

import { ChatFile } from '../stores/chatStore'
import { RnImage } from './Rn'
import RnTouchableOpacity from './RnTouchableOpacity'
import g from './variables'

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
  ImageBroken: {
    marginLeft: -20,
    marginTop: -20,
  },
})
const size = 150
const RnImageLoader: FC<ViewProps & ChatFile> = ({ url, state }) => {
  console.log({ state, url })

  const [visible, setIsVisible] = useState(false)
  const images = [{ uri: url }]
  const isLoading = state !== 'success' && state !== 'failure'
  const onShowImage = useCallback(() => {
    images.length > 0 && setIsVisible(true)
  }, [images])

  return (
    <View style={css.Image}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={css.Loading} />
      )}
      {state === 'success' && (
        <RnTouchableOpacity onPress={onShowImage}>
          <RnImage source={{ uri: url }} style={css.Image} />
        </RnTouchableOpacity>
      )}
      {state === 'failure' && (
        <View style={css.ImageBroken}>
          <Svg height={size} viewBox='0 0 24 24' width={size}>
            <Path d={mdiImageBrokenVariant} fill={'grey'} />
          </Svg>
        </View>
      )}
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
