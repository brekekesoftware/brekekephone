import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

import type { Call } from '../stores/Call'
import { convertExInfo } from '../utils/convertExInfo'
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
      remoteUserOptionsTable,
      mutedVideo,
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
    const height = Dimensions.get('window').height
    const finalHeight = isPortrait ? 182 : 86
    const finalWidth = Math.floor(width / (isPortrait ? 3.5 : 4) - 16)
    return (
      <>
        <RnTouchableOpacity
          style={{ ...styles.container, height, maxHeight: height }}
          onPress={showButtonsInVideoCall ? undefined : onButtonsInVideo}
          activeOpacity={1}
        >
          <VideoPlayer
            sourceObject={
              convertExInfo(
                remoteUserOptionsTable?.[videoStreamActive?.user ?? '']?.exInfo,
              )
                ? videoStreamActive?.remoteStreamObject
                : null
            }
            isShowLoading
            zOrder={0}
          />
        </RnTouchableOpacity>
        {!!localStreamObject && (
          <View style={styles.streams}>
            <ScrollView
              horizontal
              style={isPortrait ? styles.scrollView : styles.scrollViewLandcape}
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
                enabled={!mutedVideo}
              />
              {videoClientSessionTable.map(item => (
                <VideoViewItem
                  sourceObject={item.remoteStreamObject}
                  active={item.vId === videoStreamActive?.vId}
                  key={item.vId}
                  view={{ width: finalWidth, height: finalHeight }}
                  onSelect={() => updateVideoStreamActive(item)}
                  enabled={convertExInfo(
                    remoteUserOptionsTable?.[item.user]?.exInfo,
                  )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    height: 'auto',
  },
  scrollViewLandcape: {
    height: 300,
  },
  contentScrollView: { gap: 16, padding: 16 },
  streams: {
    zIndex: 210,
    position: 'absolute',
    height: 'auto',
    width: '100%',
    bottom: 0,
  },
})