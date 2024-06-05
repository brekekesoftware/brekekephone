import { observer } from 'mobx-react'
import { Component } from 'react'
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
}

@observer
export class VideoViewItem extends Component<VideoViewItemProps, any> {
  constructor(props) {
    super(props)
  }

  render() {
    const {
      sourceObject,
      active = false,
      onSwitchCamera,
      showSwitchCamera = false,
      view,
      onSelect,
    } = this.props
    return (
      <View
        style={[
          { ...styles.container, width: view.width, height: view.height },
          active ? styles.active : undefined,
        ]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => onSelect?.(sourceObject)}
        >
          <VideoPlayer sourceObject={sourceObject} zOrder={1} />
        </TouchableOpacity>
        {showSwitchCamera && (
          <View
            style={{
              ...styles.switchCameraView,
              top: view.height * 0.4,
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
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    position: 'relative',
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
    borderRadius: 4,
    overflow: 'hidden',
  },
})
