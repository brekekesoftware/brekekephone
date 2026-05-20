import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Dimensions } from 'react-native'

import type { ScrollViewRn } from '@/rn/core/components/scroll-view'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { VideoViewItem } from '#/components/video-view-item'
import type { Call } from '#/stores/call'
import { checkMutedRemoteUser } from '#/utils/check-muted-remote-user'

type CallVideoCarouselProps = {
  call: Call
  showButtonsInVideoCall: boolean
  onButtonsInVideo(): void
}

export const CallVideosCarousel = observer(
  ({
    call: {
      localStreamObject,
      videoStreamActive,
      updateVideoStreamActive,
      videoClientSessionTable,
      toggleSwitchCamera,
      isFrontCamera,
      remoteUserOptionsTable,
      mutedVideo,
      toggleVideo,
    },
  }: CallVideoCarouselProps) => {
    const refScroll = useRef<ScrollViewRn>(null)

    useEffect(() => {
      if (
        (videoClientSessionTable.length && !videoStreamActive) ||
        !videoClientSessionTable.find(
          item => item.vId === videoStreamActive?.vId,
        )
      ) {
        updateVideoStreamActive(videoClientSessionTable[0])
      }
      if (!videoClientSessionTable.length) {
        updateVideoStreamActive(null)
      }
    }, [updateVideoStreamActive, videoClientSessionTable, videoStreamActive])

    const width = Dimensions.get('window').width
    const finalHeight = 182
    const finalWidth = Math.floor(width / 3.5 - 16)

    return (
      !!localStreamObject && (
        <View className='absolute h-auto w-full bottom-0 z-11 pointer-events-box-none'>
          <ScrollView
            horizontal
            className='h-auto'
            contentContainerClassName='gap-4 p-4'
            showsHorizontalScrollIndicator={false}
            ref={refScroll}
            overScrollMode='never'
          >
            <VideoViewItem
              sourceObject={localStreamObject}
              view={{ width: finalWidth, height: finalHeight }}
              showSwitchCamera
              onSwitchCamera={() => toggleSwitchCamera()}
              isFrontCamera={isFrontCamera}
              enabled={!mutedVideo}
              toggleVideo={toggleVideo}
            />
            {videoClientSessionTable.length > 1 &&
              videoClientSessionTable.map(item => (
                <VideoViewItem
                  sourceObject={item.remoteStreamObject}
                  active={item.vId === videoStreamActive?.vId}
                  key={item.vId}
                  view={{ width: finalWidth, height: finalHeight }}
                  onSelect={() => updateVideoStreamActive(item)}
                  enabled={checkMutedRemoteUser(
                    remoteUserOptionsTable?.[item.user]?.muted,
                  )}
                />
              ))}
          </ScrollView>
        </View>
      )
    )
  },
)

