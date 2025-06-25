import { action } from 'mobx'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Component } from 'react'
import type {
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponderInstance,
} from 'react-native'
import { PanResponder, Platform, StyleSheet, View } from 'react-native'

import { v } from '#/components/variables'
import { VideoPlayer } from '#/components/VideoPlayer'
import { ctx } from '#/stores/ctx'
import { RnStacker } from '#/stores/RnStacker'

const css = StyleSheet.create({
  Mini: {
    position: 'absolute',
    width: 150,
    backgroundColor: 'black',
    ...Platform.select({
      android: {
        borderRadius: 75,
        height: 150,
      },
      ios: {
        borderRadius: 75,
        height: 150,
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
    this.view?.setNativeProps({
      style: {
        left: ctx.call.videoPositionL + gesture.dx,
        top: ctx.call.videoPositionT + gesture.dy,
      },
    })
  }

  @action onDrop = (
    e: GestureResponderEvent,
    gesture: PanResponderGestureState,
  ) => {
    Object.assign(ctx.call, {
      videoPositionL: ctx.call.videoPositionL + gesture.dx,
      videoPositionT: ctx.call.videoPositionT + gesture.dy,
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
