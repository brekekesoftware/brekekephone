import { observer } from 'mobx-react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

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
  } = props

  return (
    <View
      style={[
        styles.container,
        active ? styles.active : undefined,
        {
          width: view.width,
          height: view.height,
          backgroundColor: enabled ? undefined : 'black',
        },
      ]}
    >
      <View style={{ flex: 1 }}>
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
    borderRadius: 4,
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
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
