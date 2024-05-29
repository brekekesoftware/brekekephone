import { useRef, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

import { EOrientation, useOrientation } from '../utils/useOrientation'
import { VideoViewItem } from './VideoViewItem'

const data = [...new Array(6).keys()]

export const CallVideosCarousel = () => {
  const refScroll = useRef<ScrollView>(null)

  const [cur, setCur] = useState(data[0])

  const orientation = useOrientation()
  const isPortrait = orientation === EOrientation.Portrait
  const width = Dimensions.get('window').width
  const finalWidth = Math.floor(width / (isPortrait ? 3.5 : 4) - 16)

  const handleScroll = item => {
    setCur(item)
    console.log('#Duy Phan console item', item)
    refScroll.current?.scrollTo({ x: width * item, y: 0, animated: true })
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        style={styles.scrollView}
        contentContainerStyle={{ gap: 16, height: 200, padding: 16 }}
        showsHorizontalScrollIndicator={false}
        ref={refScroll}
      >
        {data.map(item => (
          <VideoViewItem
            sourceObject={null as any}
            active={item === cur}
            key={item}
            // showSwitchCamera
            view={{ width: finalWidth, height: isPortrait ? 182 : 86 }}
            onSelect={() => handleScroll(item)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    minHeight: 220,
    zIndex: 9999,
  },
  scrollView: {
    flex: 1,
    // padding: 16,
  },
})
