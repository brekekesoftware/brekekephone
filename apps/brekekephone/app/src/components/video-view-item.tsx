import { observer } from 'mobx-react'

import { View } from '@/rn/core/components/view'
import { mdiCameraRotate, mdiVideo, mdiVideoOff } from '#/assets/icons'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { VideoPlayer } from '#/components/video-player'
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
  const sizeCls = `w-[${view.width}px] h-[${view.height}px]`
  return (
    <View
      className={[
        'relative overflow-hidden rounded border-2 border-white',
        active && 'border-4 border-[#4cc5de]',
        !enabled && 'bg-black',
        sizeCls,
      ]}
    >
      <View className='flex-1'>
        <RnTouchableOpacity
          className='h-full w-full flex-1'
          onPress={() => onSelect?.(sourceObject)}
        >
          <VideoPlayer
            sourceObject={enabled ? sourceObject : null}
            zOrder={1}
          />
        </RnTouchableOpacity>
      </View>
      {showSwitchCamera && c && (
        <View className='absolute bottom-0 left-0 z-1 w-full flex-row items-center justify-evenly bg-black/30'>
          <RnTouchableOpacity
            onPress={toggleVideo}
            className='h-7 w-7 items-center justify-center'
          >
            <RnIcon
              path={
                c.localVideoEnabled && !c.mutedVideo ? mdiVideo : mdiVideoOff
              }
              color='white'
            />
          </RnTouchableOpacity>

          <RnTouchableOpacity
            onPress={onSwitchCamera}
            className='h-7 w-7 items-center justify-center'
          >
            <RnIcon path={mdiCameraRotate} color='white' />
          </RnTouchableOpacity>
        </View>
      )}
    </View>
  )
})
