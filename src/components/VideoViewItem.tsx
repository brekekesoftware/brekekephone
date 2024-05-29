import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { mdiCameraRolate } from '../assets/icons'
import { RnIcon } from './RnIcon'
import { VideoPlayer } from './VideoPlayer'

type VideoViewItemProps = {
  sourceObject: MediaStream
  active?: boolean
  showSwitchCamera?: boolean
  onSwitchCamera?(): void
  onSelect?(): void
  view: { width: number; height: number }
}

export const VideoViewItem = ({
  sourceObject,
  active = false,
  onSwitchCamera,
  showSwitchCamera = false,
  view,
  onSelect,
}: VideoViewItemProps) => (
  <View
    style={[
      { ...styles.container, width: view.width, height: view.height },
      active ? styles.active : undefined,
    ]}
  >
    <TouchableOpacity style={styles.touchable} onPress={() => onSelect?.()}>
      <VideoPlayer sourceObject={sourceObject} />
    </TouchableOpacity>
    {showSwitchCamera && (
      <View
        style={{
          ...styles.switchCameraView,
          top: view.height * 0.4,
          left: view.width / 2 - 20,
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

const styles = StyleSheet.create({
  container: {
    // width: 86,
    // height: 152,
    borderRadius: 4,
    position: 'relative',
    backgroundColor: 'wheat',
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
    backgroundColor: 'red',
  },
  touchable: {
    flex: 1,
  },
})
