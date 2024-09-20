import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { mdiCameraRolate } from '../assets/icons'
import { RnIcon } from './RnIcon'
import { VideoPlayer } from './VideoPlayer'

type VideoViewItemProps = {
  sourceObject: MediaStream | null
  active?: boolean
  showSwitchCamera?: boolean
  onSwitchCamera?(): void
  onSelect?(item: MediaStream | null): void
  view: { width: number; height: number }
  enabled?: boolean
  isFrontCamera?: boolean
  isPortrait?: boolean
}

export const VideoViewItem = observer((props: VideoViewItemProps) => {
  const {
    sourceObject,
    active = false,
    onSwitchCamera,
    showSwitchCamera = false,
    view,
    onSelect,
    enabled = true,
    isFrontCamera,
    isPortrait,
  } = props

  const [spinValue] = useState(new Animated.Value(0))
  const refFirstTime = useRef(true)

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  useEffect(() => {
    if (showSwitchCamera && !refFirstTime.current) {
      !isFrontCamera
        ? Animated.timing(spinValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start()
        : Animated.timing(spinValue, {
            toValue: 0,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start()
    }
  }, [isFrontCamera])

  useEffect(() => {
    refFirstTime.current = false
  }, [])

  return (
    <View
      style={[
        styles.container,
        active ? styles.active : undefined,
        {
          width: view.width,
          height: view.height,
        },
      ]}
    >
      <View style={{flex: 1 }}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => onSelect?.(sourceObject)}
        >
          <VideoPlayer
            sourceObject={enabled ? sourceObject : null}
            zOrder={1}
          />
        </TouchableOpacity>
      </View>
      {showSwitchCamera && (
        <View
          style={{
            ...styles.switchCameraView,
            top: view.height * (isPortrait ? 0.4 : 0.3),
            left: view.width / 2 - 15,
          }}
        >
          <TouchableOpacity
            onPress={() => onSwitchCamera?.()}
            style={styles.switchCameraBtn}
          >
            <RnIcon path={mdiCameraRolate} color='white' />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  active: {
    borderColor: '#4cc5de',
    borderWidth: 4,
  },
  switchCameraView: {
    position: 'absolute',
    zIndex: 1,
  },
  switchCameraBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})
