import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

import type { Call } from '../stores/Call'
import { EOrientation, useOrientation } from '../utils/useOrientation'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { VideoPlayer } from './VideoPlayer'
import { VideoViewItem } from './VideoViewItem'

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
    },
    showButtonsInVideoCall,
    onButtonsInVideo,
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
    }, [videoClientSessionTable.length, videoStreamActive])

    const orientation = useOrientation()
    const isPortrait = orientation === EOrientation.Portrait
    const width = Dimensions.get('window').width
    const finalHeight = isPortrait ? 182 : 86
    const finalWidth = Math.floor(width / (isPortrait ? 3.5 : 4) - 16)

    const handleScroll = item => {
      updateVideoStreamActive(item)
    }

    return (
      <>
        <RnTouchableOpacity
          style={styles.container}
          onPress={showButtonsInVideoCall ? undefined : onButtonsInVideo}
          activeOpacity={1}
        >
          <VideoPlayer
            sourceObject={videoStreamActive?.remoteStreamObject}
            zOrder={0}
          />
        </RnTouchableOpacity>
        {!!localStreamObject && (
          <View
            style={{
              ...styles.streams,
              bottom: isPortrait ? 0 : 100,
            }}
          >
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
                isPortrait={isPortrait}
              />
              {videoClientSessionTable.map(item => (
                <VideoViewItem
                  sourceObject={item.remoteStreamObject}
                  active={item.vId === videoStreamActive?.vId}
                  key={item.vId}
                  view={{ width: finalWidth, height: finalHeight }}
                  onSelect={() => handleScroll(item)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flex: 1,
  },
  scrollView: {
    height: 'auto',
  },
  contentScrollView: { gap: 16, height: 200, padding: 16 },
  streams: {
    zIndex: 200,
    position: 'absolute',
    height: 'auto',
    width: '100%',
  },
})
