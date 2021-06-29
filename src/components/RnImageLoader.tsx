import { mdiClose, mdiImageBrokenVariant } from '@mdi/js'
import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Svg, { Path } from 'react-native-svg'

import { ChatFile } from '../stores/chatStore'
import RnIcon from './RnIcon'
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
    backgroundColor: '#00000090',
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  imageBroken: {
    marginLeft: -20,
    marginTop: -20,
  },
  btnClose: {
    position: 'absolute',
    top: getStatusBarHeight(true),
    right: 15,
    zIndex: 10,
  },
  modal: {
    backgroundColor: 'blue',
  },
})
const size = 150
const RnImageLoader: FC<ViewProps & ChatFile> = ({ url, state, id, name }) => {
  const [visible, setIsVisible] = useState(false)
  const images = [{ url: url || '' }]
  const onShowImage = useCallback(() => {
    images.length > 0 && setIsVisible(true)
  }, [images])
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && url
  const onSwipeDown = useCallback(() => {
    setIsVisible(false)
  }, [])
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
      <Modal visible={visible} style={css.modal} animationType={'slide'}>
        <RnTouchableOpacity style={css.btnClose} onPress={onSwipeDown}>
          <RnIcon path={mdiClose} color={'black'} size={30} />
        </RnTouchableOpacity>
        <ImageViewer imageUrls={images} renderIndicator={() => <View />} />
      </Modal>
    </View>
  )
}

export default RnImageLoader
