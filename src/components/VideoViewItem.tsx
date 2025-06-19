import { observer } from 'mobx-react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { mdiCameraRotate, mdiVideo, mdiVideoOff } from '#/assets/icons'
import { RnIcon } from '#/components/RnIcon'
import { VideoPlayer } from '#/components/VideoPlayer'
import { ctx } from '#/stores/ctx'

type VideoViewItemProps = {
  sourceObject: MediaStream | null
  active?: boolean
  showSwitchCamera?: boolean
  onSwitchCamera?(): void
  onSelect?(item: MediaStream | null): void
  view: { width: number; height: number }
  enabled?: boolean
  isFrontCamera?: boolean
  toggleVideo?(): void
}

export const VideoViewItem = observer((props: VideoViewItemProps) => {
  const {
    sourceObject,
    active = false,
    onSwitchCamera,
    toggleVideo,
    showSwitchCamera = false,
    view,
    onSelect,
    enabled = true,
  } = props
  const c = ctx.call.getOngoingCall()
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
      {showSwitchCamera && c && (
        <View
          style={{
            ...styles.switchCameraView,
          }}
        >
          <TouchableOpacity
            onPress={() => toggleVideo?.()}
            style={styles.switchCameraBtn}
          >
            <RnIcon
              path={
                c.localVideoEnabled && !c.mutedVideo ? mdiVideo : mdiVideoOff
              }
              color='white'
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSwitchCamera?.()}
            style={styles.switchCameraBtn}
          >
            <RnIcon path={mdiCameraRotate} color='white' />
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
    bottom: 0,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
