import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Dimensions, ScrollView, View } from 'react-native'
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
    const refScroll = useRef<ScrollView>(null)

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
        <View style={[styles.streams, { zIndex: 11 }]} pointerEvents='box-none'>
          <ScrollView
            horizontal
            style={styles.scrollView}
            contentContainerStyle={[styles.contentScrollView]}
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

const styles = {
  container: {
    height: '100%' as const,
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  scrollView: {
    height: 'auto' as any,
  },
  contentScrollView: { gap: 16, padding: 16 },
  streams: {
    position: 'absolute' as const,
    height: 'auto' as any,
    width: '100%' as const,
    bottom: 0,
  },
}
