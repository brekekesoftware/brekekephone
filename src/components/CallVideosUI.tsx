import { action } from 'mobx'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Component } from 'react'
import type {
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponderInstance,
} from 'react-native'
import {
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from 'react-native'

import { v } from '#/components/variables'
import { VideoPlayer } from '#/components/VideoPlayer'
import { ctx } from '#/stores/ctx'
import { RnStacker } from '#/stores/RnStacker'

const MINI_WIDTH = 150
const MINI_HEIGHT = 150

const css = StyleSheet.create({
  Mini: {
    position: 'absolute',
    width: MINI_WIDTH,
    backgroundColor: 'black',
    ...Platform.select({
      android: {
        borderRadius: 75,
        height: MINI_HEIGHT,
      },
      ios: {
        borderRadius: 75,
        height: MINI_HEIGHT,
      },
      web: {
        borderRadius: v.borderRadius,
      },
    }),
    overflow: 'hidden',
    ...v.boxShadow,
    ...v.backdropZindex,
  },
})

const calculateBoundedPosition = (
  currentLeft: number,
  currentTop: number,
  dx: number,
  dy: number,
): { left: number; top: number } => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

  let newLeft = currentLeft + dx
  let newTop = currentTop + dy

  newLeft = Math.max(0, Math.min(newLeft, screenWidth - MINI_WIDTH))
  newTop = Math.max(0, Math.min(newTop, screenHeight - MINI_HEIGHT))

  return { left: newLeft, top: newTop }
}

type Props = {
  onDoubleTap: Function
  sourceObject: MediaStream
}

@observer
class Mini extends Component<Props> {
  panResponder: PanResponderInstance
  view?: View
  private lastTap?: number

  state = {}
  constructor(props: Props) {
    super(props)

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: this.onDrag,
      onPanResponderRelease: this.onDrop,
      onPanResponderTerminate: this.onDrop,
    })
  }

  render() {
    return (
      <View
        ref={this.setViewRef}
        style={[
          css.Mini,
          {
            top: ctx.call.videoPositionT,
            left: ctx.call.videoPositionL,
          },
        ]}
        {...this.panResponder.panHandlers}
      >
        <VideoPlayer sourceObject={this.props.sourceObject} />
      </View>
    )
  }

  setViewRef = (view: View) => {
    this.view = view
  }

  onDrag = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
    const { left, top } = calculateBoundedPosition(
      ctx.call.videoPositionL,
      ctx.call.videoPositionT,
      gesture.dx,
      gesture.dy,
    )

    this.view?.setNativeProps({
      style: { left, top },
    })
  }

  @action onDrop = (
    e: GestureResponderEvent,
    gesture: PanResponderGestureState,
  ) => {
    const { left, top } = calculateBoundedPosition(
      ctx.call.videoPositionL,
      ctx.call.videoPositionT,
      gesture.dx,
      gesture.dy,
    )

    Object.assign(ctx.call, {
      videoPositionL: left,
      videoPositionT: top,
    })

    const n = Date.now()
    if (
      gesture.dx <= 10 &&
      gesture.dy <= 10 &&
      this.lastTap &&
      n - this.lastTap <= 500
    ) {
      this.props.onDoubleTap()
    }
    this.lastTap = n
  }
}

@observer
class Control extends Component<{
  sourceObject: MediaStream
}> {
  render() {
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    if (
      ctx.call.inPageCallManage ||
      s.name === 'PageCallTransferDial' ||
      s.name === 'PageCallTransferAttend'
    ) {
      return null
    }
    return <Mini {...this.props} onDoubleTap={ctx.nav.goToPageCallManage} />
  }
}

export const CallVideosUI: FC<{
  callIds: string[]
  resolveCall: Function
}> = observer(p => (
  <>
    {p.callIds.map(id => (
      <Control key={id} {...p.resolveCall(id)} />
    ))}
  </>
))
