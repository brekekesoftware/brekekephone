import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { ViewProps } from 'react-native'
import { ActivityIndicator, Dimensions, Modal, StatusBar } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'
import Svg, { Path } from 'react-native-svg'
import Video from 'react-native-video'

import { View } from '@/rn/core/components/view'
import {
  mdiCloseCircleOutline,
  mdiImageBrokenVariant,
  mdiPlayCircleOutline,
} from '#/assets/icons'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import { isAndroid } from '#/config'
import type { ChatFile } from '#/stores/chat-store'

const vVideoModalStyle = {
  width: Dimensions.get('screen').width,
  height: Dimensions.get('window').height,
}
const videoStyle = {
  width: 150,
  height: 150,
  alignSelf: 'center' as const,
  borderRadius: 5,
  alignItems: 'center' as const,
  overflow: 'hidden' as const,
}
const imageStyle = {
  width: 150,
  height: 150,
  borderRadius: 5,
  overflow: 'hidden' as const,
}
const loadingStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  backgroundColor: '#00000090',
  width: 150,
  height: 150,
  borderRadius: 5,
  overflow: 'hidden' as const,
}
const btnCloseStyle = {
  top: isAndroid ? StatusBar.currentHeight : 44,
  elevation: 2,
}

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
        <View className='w-37.5 h-37.5 rounded-[5px] items-center overflow-hidden bg-border'>
          <Video
            source={{ uri: convertUri(url) }}
            resizeMode='contain'
            muted
            paused={true}
            style={videoStyle}
            enterPictureInPictureOnLeave
            preventsDisplaySleepDuringVideoPlayback={false}
          />
          <View className='w-37.5 h-37.5 rounded-[5px] absolute top-0 left-0 items-center overflow-hidden z-100 bg-layer-video'>
            <RnTouchableOpacity onPress={onShowImage}>
              <RnIcon path={mdiPlayCircleOutline} color='white' size={40} />
            </RnTouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View className='w-37.5 h-37.5 rounded-[5px] items-center overflow-hidden bg-border'>
          <Video
            source={{ uri: convertUri(url) }}
            resizeMode='contain'
            paused={true}
            style={videoStyle}
            controls={true}
            preventsDisplaySleepDuringVideoPlayback={false}
          />
        </View>
      )
    }
  }
  const renderView = () =>
    fileType === 'image' ? (
      <RnTouchableOpacity onPress={onShowImage}>
        <FastImage source={{ uri: convertUri(url) }} style={imageStyle} />
      </RnTouchableOpacity>
    ) : (
      renderVideo()
    )
  const onRequestClose = () => {
    setIsVisible(false)
  }
  return (
    <View className='w-37.5 h-37.5 rounded-[5px] overflow-hidden'>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={loadingStyle} />
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
        animationType='slide'
        onRequestClose={onRequestClose}
      >
        <RnTouchableOpacity
          className='absolute right-3.75 z-10 rounded-[15px] bg-background'
          style={btnCloseStyle}
          onPress={onSwipeDown}
        >
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
              style={vVideoModalStyle}
            />
          ))}
      </Modal>
    </View>
  )
}
