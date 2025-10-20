import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { ViewProps } from 'react-native'
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'
import Svg, { Path } from 'react-native-svg'
import Video from 'react-native-video'

import {
  mdiCloseCircleOutline,
  mdiImageBrokenVariant,
  mdiPlayCircleOutline,
} from '#/assets/icons'
import { RnIcon } from '#/components/RnIcon'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'
import { isAndroid } from '#/config'
import type { ChatFile } from '#/stores/chatStore'

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
    top: isAndroid ? StatusBar.currentHeight : 44,
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
  fileType,
  save,
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

  const images = useMemo(
    () => (url ? [{ url: convertUri(url) }] : undefined),
    [url, convertUri],
  )
  const isLoading =
    (state !== 'success' && state !== 'failure' && state !== 'stopped') ||
    (save && save === 'started')
  const isLoadFailed =
    state === 'failure' || state === 'stopped' || (save && save === 'failure')
  const isLoadSuccess =
    state === 'success' && !!url && save && save === 'success'

  const onShowImage = useCallback(() => {
    if (images?.length) {
      setIsVisible(true)
    }
  }, [images])

  const onSwipeDown = useCallback(() => {
    setIsVisible(false)
  }, [])

  const renderVideo = () => {
    if (isAndroid) {
      return (
        <View style={css.vVideo}>
          <Video
            source={{ uri: convertUri(url) }}
            resizeMode='contain'
            muted
            paused={true}
            style={css.video}
            enterPictureInPictureOnLeave
          />
          <View style={css.vlayerVideo}>
            <RnTouchableOpacity onPress={onShowImage}>
              <RnIcon path={mdiPlayCircleOutline} color='white' size={40} />
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
  const renderView = () =>
    fileType === 'image' ? (
      <RnTouchableOpacity onPress={onShowImage}>
        <FastImage source={{ uri: convertUri(url) }} style={css.image} />
      </RnTouchableOpacity>
    ) : (
      renderVideo()
    )
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
        animationType='slide'
        onRequestClose={onRequestClose}
      >
        <RnTouchableOpacity style={css.btnClose} onPress={onSwipeDown}>
          <RnIcon path={mdiCloseCircleOutline} color='black' size={30} />
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
