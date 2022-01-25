import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Svg, { Path } from 'react-native-svg'
import Video from 'react-native-video'

import {
  mdiCloseCircleOutline,
  mdiImageBrokenVariant,
  mdiPlayCircleOutline,
} from '../assets/icons'
import { ChatFile } from '../stores/chatStore'
import { RnIcon } from './RnIcon'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const css = StyleSheet.create({
  vVideoModal: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('window').height,
  },
  video: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    overflow: 'hidden',
  },
  vlayerVideo: {
    width: 150,
    height: 150,
    borderRadius: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 100,
    backgroundColor: v.layerBgVideo,
  },
  vVideo: {
    width: 150,
    height: 150,
    borderRadius: 5,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: v.borderBg,
  },
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
    elevation: 2,
    borderRadius: 15,
    backgroundColor: 'white',
  },
  btnPause: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: 'blue',
  },
})

const size = 150
export const RnImageVideoLoader: FC<ViewProps & ChatFile> = ({
  url,
  state,
  id,
  name,
  incoming,
  fileType,
}) => {
  const [visible, setIsVisible] = useState(false)

  const convertUri = useCallback((_?: string) => {
    if (!_) {
      return ''
    }
    if (_.startsWith('content://')) {
      return _
    }
    const nextUrl = _.startsWith('file://') ? _ : `file://${_}`
    return nextUrl
  }, [])

  const images = url ? [{ url: convertUri(url) }] : []
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && !!url

  const onShowImage = useCallback(() => {
    images.length > 0 && setIsVisible(true)
  }, [images])

  const onSwipeDown = useCallback(() => {
    setIsVisible(false)
  }, [])

  const renderVideo = () => {
    if (Platform.OS === 'android') {
      return (
        <View style={css.vVideo}>
          <Video
            source={{ uri: convertUri(url) }}
            resizeMode='contain'
            muted
            paused={true}
            style={css.video}
            pictureInPicture
          />
          <View style={css.vlayerVideo}>
            <RnTouchableOpacity onPress={onShowImage}>
              <RnIcon path={mdiPlayCircleOutline} color={'white'} size={40} />
            </RnTouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={css.vVideo}>
          <Video
            source={{ uri: convertUri(url) }}
            resizeMode='contain'
            paused={true}
            style={css.video}
            controls={true}
          />
        </View>
      )
    }
  }
  const renderView = () => {
    return fileType === 'image' ? (
      <RnTouchableOpacity onPress={onShowImage}>
        <FastImage source={{ uri: convertUri(url) }} style={css.image} />
      </RnTouchableOpacity>
    ) : (
      renderVideo()
    )
  }
  const onRequestClose = () => {
    setIsVisible(false)
  }
  return (
    <View style={css.image}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={css.loading} />
      )}
      {isLoadSuccess && renderView()}
      {isLoadFailed && (
        <Svg
          preserveAspectRatio='xMinYMin slice'
          height={size}
          viewBox='3 3  18 18'
          width={size}
        >
          <Path d={mdiImageBrokenVariant} fill={v.colors.greyTextChat} />
        </Svg>
      )}
      <Modal
        visible={visible}
        style={css.modal}
        animationType={'slide'}
        onRequestClose={onRequestClose}
      >
        <RnTouchableOpacity style={css.btnClose} onPress={onSwipeDown}>
          <RnIcon path={mdiCloseCircleOutline} color={'black'} size={30} />
        </RnTouchableOpacity>
        {isLoadSuccess &&
          (fileType === 'image' ? (
            <ImageViewer imageUrls={images} renderIndicator={() => <View />} />
          ) : (
            <Video
              source={{ uri: convertUri(url) }}
              controls={true}
              paused={false}
              resizeMode='contain'
              style={css.vVideoModal}
            />
          ))}
      </Modal>
    </View>
  )
}
