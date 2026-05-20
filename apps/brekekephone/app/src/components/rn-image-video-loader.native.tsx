import type { ComponentProps, FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { ViewProps } from 'react-native'
import { Dimensions, Modal, StatusBar } from 'react-native'
import FastImageWocn from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer-fixed'
import Svg, { Path } from 'react-native-svg'
import VideoWocn from 'react-native-video'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'
import {
  mdiCloseCircleOutline,
  mdiImageBrokenVariant,
  mdiPlayCircleOutline,
} from '#/assets/icons'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import { isAndroid } from '#/config'
import type { ChatFile } from '#/stores/chat-store'

const FastImage = createClassNameComponent({ FastImageWocn }) as FC<
  ComponentProps<typeof FastImageWocn> & { className?: ClassName }
>
const Video = createClassNameComponent({ VideoWocn }) as FC<
  ComponentProps<typeof VideoWocn> & { className?: ClassName }
>

// native-only file → runtime className OK (twrnc resolve runtime, no web safelist)
const vVideoModalCls = `w-[${Dimensions.get('screen').width}px] h-[${Dimensions.get('window').height}px]`
const btnCloseCls = `top-[${isAndroid ? StatusBar.currentHeight : 44}px] android:elevation-2`

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
            className='w-37.5 h-37.5 self-center rounded-[5px] items-center overflow-hidden'
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
            className='w-37.5 h-37.5 self-center rounded-[5px] items-center overflow-hidden'
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
        <FastImage
          source={{ uri: convertUri(url) }}
          className='w-37.5 h-37.5 rounded-[5px] overflow-hidden'
        />
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
        <RnActivityIndicator
          size='small'
          color='white'
          className='absolute top-0 left-0 w-37.5 h-37.5 rounded-[5px] overflow-hidden bg-[#00000090]'
        />
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
          className={['absolute right-3.75 z-10 rounded-[15px] bg-background', btnCloseCls]}
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
              className={vVideoModalCls}
            />
          ))}
      </Modal>
    </View>
  )
}
