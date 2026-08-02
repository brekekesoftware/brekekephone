import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Dimensions } from 'react-native'
import type { ScrollViewRn } from 'rntwsc/tw/components/scroll-view'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { VideoViewItem } from '@/components/video-view-item'
import type { Call } from '@/stores/call'
import { checkMutedRemoteUser } from '@/utils/check-muted-remote-user'

type CallVideoCarouselProps = {
  call: Call
  showButtonsInVideoCall: boolean
  onButtonsInVideo(): void
  // landscape stacks the thumbnails vertically along the right edge instead of
  // the horizontal bottom strip used in portrait.
  landscape?: boolean
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
    landscape,
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
    // landscape uses a compact fixed thumbnail so the right-edge column never
    // eats the main video; portrait keeps the width-derived sizing.
    const finalHeight = landscape ? 50 : 182
    const finalWidth = landscape ? 80 : Math.floor(width / 3.5 - 16)

    return (
      !!localStreamObject && (
        <View
          className={[
            'pointer-events-box-none absolute z-101',
            landscape
              ? 'top-12 right-3 bottom-0 w-24'
              : 'bottom-0 h-auto w-full',
          ]}
        >
          <ScrollView
            horizontal={!landscape}
            className={landscape ? 'h-full w-full' : 'h-auto'}
            contentContainerClassName={
              landscape ? 'items-center gap-1 px-2 pt-2 pb-24' : 'gap-4 p-4'
            }
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            ref={refScroll}
            overScrollMode='never'
          >
            <VideoViewItem
              sourceObject={localStreamObject}
              view={{
                width: finalWidth,
                height: finalHeight,
              }}
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
                  view={{
                    width: finalWidth,
                    height: finalHeight,
                  }}
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
