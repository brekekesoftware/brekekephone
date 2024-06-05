import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

import type { Call } from '../stores/Call'
import { EOrientation, useOrientation } from '../utils/useOrientation'
import { VideoPlayer } from './VideoPlayer'
import { VideoViewItem } from './VideoViewItem'

type CallVideoCarouselProps = {
  call: Call
}

export const CallVideosCarousel = observer(
  ({
    call: {
      localStreamObject,
      videoStreamActive,
      updatevideoStreamActive,
      videoClientSessionTable,
    },
  }: CallVideoCarouselProps) => {
    const refScroll = useRef<ScrollView>(null)

    useEffect(() => {
      if (!videoStreamActive) {
        updatevideoStreamActive(Object.keys(videoClientSessionTable)?.[0])
      }
    }, [Object.keys(videoClientSessionTable).length > 0])

    const orientation = useOrientation()
    const isPortrait = orientation === EOrientation.Portrait
    const width = Dimensions.get('window').width
    const finalHeight = isPortrait ? 182 : 86
    const finalWidth = Math.floor(width / (isPortrait ? 3.5 : 4) - 16)
    console.log('#Duy Phan console', finalWidth, finalHeight)

    const handleScroll = item => {
      updatevideoStreamActive(item)
      // refScroll.current?.scrollTo({ x: width * item, y: 0, animated: true })
    }

    return (
      <View style={styles.container}>
        <VideoPlayer
          sourceObject={
            videoClientSessionTable[videoStreamActive ?? '']?.remoteStreamObject
          }
          zOrder={0}
        />
        <View
          style={{
            zIndex: 99,
            position: 'absolute',
            bottom: 0,
            height: 'auto',
          }}
        >
          <ScrollView
            horizontal
            style={styles.scrollView}
            contentContainerStyle={styles.contentScrollView}
            showsHorizontalScrollIndicator={false}
            ref={refScroll}
          >
            <VideoViewItem
              sourceObject={localStreamObject}
              view={{ width: finalWidth, height: finalHeight }}
              showSwitchCamera
            />
            {Object.keys(videoClientSessionTable).map(item => (
              <VideoViewItem
                sourceObject={
                  videoClientSessionTable[item].remoteStreamObject ?? null
                }
                active={item === videoStreamActive}
                key={item}
                view={{ width: finalWidth, height: finalHeight }}
                onSelect={() => handleScroll(item)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
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
})
