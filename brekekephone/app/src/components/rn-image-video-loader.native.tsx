import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { ViewProps } from 'react-native'
import { Modal, StatusBar } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'
import { isAndroid } from 'rntwsc/platform'
import { View } from 'rntwsc/tw/components/view'

import {
  mdiClose,
  mdiImageBrokenVariant,
  mdiPlayCircleOutline,
} from '@/assets/icons'
import { RnActivityIndicator } from '@/components/rn-class-name-components'
import {
  RnFastImage,
  RnVideo,
} from '@/components/rn-class-name-components.native'
import { RnIcon } from '@/components/rn-icon'
import { RnTouchableOpacity } from '@/components/rn-touchable-opacity'
import type { ChatFile } from '@/stores/chat-store'
import { intl } from '@/stores/intl'

const size = 150
const toFileUri = (uri?: string) =>
  !uri || uri.startsWith('content://') || uri.startsWith('file://')
    ? uri || ''
    : `file://${uri}`

export const RnImageVideoLoader: FC<ViewProps & ChatFile> = ({
  url,
  state,
  fileType,
  save,
}) => {
  const isVideo = fileType === 'video'
  const [imageVisible, setImageVisible] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const source = useMemo(
    () => ({
      uri: toFileUri(url),
    }),
    [url],
  )

  const images = useMemo(
    () =>
      source.uri
        ? [
            {
              url: source.uri,
            },
          ]
        : undefined,
    [source],
  )
  const isLoading =
    (state !== 'success' && state !== 'failure' && state !== 'stopped') ||
    (save && save === 'started')
  const isLoadFailed =
    state === 'failure' || state === 'stopped' || (save && save === 'failure')
  const isLoadSuccess =
    state === 'success' && !!url && save && save === 'success'

  const onOpenPreview = useCallback(() => {
    if (!source.uri) {
      return
    }
    // Video plays through the platform's default fullscreen player (its own
    // close button drives onFullscreenPlayerDidDismiss). Images keep the modal
    // preview. Using the native fullscreen player instead of wrapping a video
    // in a modal avoids the iOS presentation-stack conflict that stopped the
    // preview from reopening.
    if (isVideo) {
      setFullscreen(true)
    } else {
      setImageVisible(true)
    }
  }, [isVideo, source])

  const onExitFullscreen = useCallback(() => setFullscreen(false), [])
  const onCloseImage = useCallback(() => setImageVisible(false), [])

  const renderVideo = () => (
    <View className='bg-border rounded-card h-37.5 w-37.5 items-center overflow-hidden'>
      <RnVideo
        source={source}
        resizeMode='contain'
        muted={!fullscreen}
        paused={!fullscreen}
        fullscreen={fullscreen}
        className='rounded-card h-37.5 w-37.5 items-center self-center overflow-hidden'
        controls={fullscreen}
        enterPictureInPictureOnLeave={isAndroid}
        preventsDisplaySleepDuringVideoPlayback={false}
        onFullscreenPlayerDidDismiss={onExitFullscreen}
      />
      <RnTouchableOpacity
        accessibilityRole='button'
        className='bg-modal-overlay rounded-card absolute inset-0 z-100 items-center justify-center overflow-hidden'
        onPress={onOpenPreview}
      >
        <RnIcon path={mdiPlayCircleOutline} className='text-white' size={40} />
      </RnTouchableOpacity>
    </View>
  )

  const renderView = () =>
    !isVideo ? (
      <RnTouchableOpacity onPress={onOpenPreview}>
        <RnFastImage
          source={source}
          className='rounded-card h-37.5 w-37.5 overflow-hidden'
        />
      </RnTouchableOpacity>
    ) : (
      renderVideo()
    )

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
      {!isVideo && (
        <Modal
          visible={imageVisible}
          animationType='fade'
          hardwareAccelerated
          presentationStyle='fullScreen'
          statusBarTranslucent
          onRequestClose={onCloseImage}
        >
          {imageVisible && (
            <StatusBar backgroundColor='black' barStyle='light-content' />
          )}
          <RnTouchableOpacity
            accessibilityLabel={intl`Close`}
            accessibilityRole='button'
            className='bg-modal-overlay android:elevation-2 absolute top-11 right-3.75 z-10 h-10 w-10 items-center justify-center rounded-full'
            style={
              isAndroid
                ? {
                    top: (StatusBar.currentHeight || 0) + 12,
                  }
                : undefined
            }
            hitSlop={12}
            onPress={onCloseImage}
          >
            <RnIcon path={mdiClose} className='text-white' size={26} />
          </RnTouchableOpacity>
          <View className='flex-1 bg-black'>
            {imageVisible && isLoadSuccess && (
              <ImageViewer
                imageUrls={images}
                renderIndicator={() => <View />}
                enableSwipeDown
                onSwipeDown={onCloseImage}
              />
            )}
          </View>
        </Modal>
      )}
    </View>
  )
}
