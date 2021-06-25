import { mdiImageBrokenVariant } from '@mdi/js'
import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
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
const RnImageLoader: FC<ViewProps & ChatFile> = ({ url, state, id, name }) => {
  console.log('saveBlobLoader', { id, url, state, name })
  const [visible, setIsVisible] = useState(false)
  const images = [{ uri: url }]
  const isLoading = state !== 'success' && state !== 'failure'
  const onShowImage = useCallback(() => {
    images.length > 0 && setIsVisible(true)
  }, [images])

  // const ImageShow = Platform.OS === 'android'?Image:RnImage
  return (
    <View style={css.Image}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={css.Loading} />
      )}
      {state === 'success' && url && (
        <RnTouchableOpacity onPress={onShowImage}>
          <RnImage source={{ uri: url }} style={css.Image} />
        </RnTouchableOpacity>
      )}
      {state === 'failure' && (
        <Svg
          preserveAspectRatio='xMinYMin slice'
          height={size}
          viewBox='3 3  18 18'
          width={size}
        >
          <Path d={mdiImageBrokenVariant} fill={g.colors.greyTextChat} />
        </Svg>
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
