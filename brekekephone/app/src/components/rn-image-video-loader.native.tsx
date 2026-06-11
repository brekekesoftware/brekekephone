import { View } from '@rntwsc/rn/core/components/view'
import { isAndroid } from '@rntwsc/rn/core/utils/platform'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { ViewProps } from 'react-native'
import { Modal, StatusBar } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'

import {
  mdiCloseCircleOutline,
  mdiImageBrokenVariant,
  mdiPlayCircleOutline,
} from '#/assets/icons'
import { RnActivityIndicator } from '#/components/rn-class-name-components'
import {
  RnFastImage,
  RnVideo,
} from '#/components/rn-class-name-components.native'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ChatFile } from '#/stores/chat-store'

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
    () =>
      url
        ? [
            {
              url: convertUri(url),
            },
          ]
        : undefined,
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
        <View className='bg-border rounded-card h-37.5 w-37.5 items-center overflow-hidden'>
          <RnVideo
            source={{
              uri: convertUri(url),
            }}
            resizeMode='contain'
            muted
            paused={true}
            className='rounded-card h-37.5 w-37.5 items-center self-center overflow-hidden'
            enterPictureInPictureOnLeave
            preventsDisplaySleepDuringVideoPlayback={false}
          />
          <View className='bg-modal-overlay rounded-card absolute top-0 left-0 z-100 h-37.5 w-37.5 items-center overflow-hidden'>
            <RnTouchableOpacity onPress={onShowImage}>
              <RnIcon path={mdiPlayCircleOutline} color='white' size={40} />
            </RnTouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View className='bg-border rounded-card h-37.5 w-37.5 items-center overflow-hidden'>
          <RnVideo
            source={{
              uri: convertUri(url),
            }}
            resizeMode='contain'
            paused={true}
            className='rounded-card h-37.5 w-37.5 items-center self-center overflow-hidden'
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
        <RnFastImage
          source={{
            uri: convertUri(url),
          }}
          className='rounded-card h-37.5 w-37.5 overflow-hidden'
        />
      </RnTouchableOpacity>
    ) : (
      renderVideo()
    )
  const onRequestClose = () => {
    setIsVisible(false)
  }
  return (
    <View className='rounded-card h-37.5 w-37.5 items-center justify-center overflow-hidden'>
      {isLoading && (
        <RnActivityIndicator
          size='small'
          color='white'
          className='bg-modal-overlay rounded-card absolute top-0 left-0 h-37.5 w-37.5 overflow-hidden'
        />
      )}
      {isLoadSuccess && renderView()}
      {isLoadFailed && (
        <RnIcon
          path={mdiImageBrokenVariant}
          size={size}
          className='text-foreground-subtle flex-none'
        />
      )}
      <Modal
        visible={visible}
        animationType='slide'
        onRequestClose={onRequestClose}
      >
        <RnTouchableOpacity
          className='bg-background android:elevation-2 absolute top-11 right-3.75 z-10 rounded-full'
          style={
            isAndroid
              ? {
                  top: StatusBar.currentHeight,
                }
              : undefined
          }
          onPress={onSwipeDown}
        >
          <RnIcon
            path={mdiCloseCircleOutline}
            className='text-foreground'
            size={30}
          />
        </RnTouchableOpacity>
        {isLoadSuccess &&
          (fileType === 'image' ? (
            <ImageViewer imageUrls={images} renderIndicator={() => <View />} />
          ) : (
            <RnVideo
              source={{
                uri: convertUri(url),
              }}
              controls={true}
              paused={false}
              resizeMode='contain'
              className='h-screen w-screen'
            />
          ))}
      </Modal>
    </View>
  )
}
