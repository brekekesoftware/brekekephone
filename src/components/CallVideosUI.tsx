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
import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { RnStacker } from '#/stores/RnStacker'

const MINI_WIDTH = 150
const MINI_HEIGHT = 150

const css = StyleSheet.create({
  Mini: {
    position: isWeb ? 'fixed' : 'absolute',
    width: MINI_WIDTH,
    height: MINI_HEIGHT,
    backgroundColor: 'black',
    borderRadius: 75,
    overflow: 'hidden',
    ...v.boxShadow,
    ...v.backdropZindex,
    ...(isWeb &&
      ({
        cursor: 'move',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      } as any)),
  },
})

const calculateBoundedPosition = (
  currentLeft: number,
  currentTop: number,
  dx: number,
  dy: number,
): { left: number; top: number } => {
  const screenWidth = isWeb ? window.innerWidth : Dimensions.get('window').width
  const screenHeight = isWeb
    ? window.innerHeight
    : Dimensions.get('window').height

  const newLeft = Math.max(
    0,
    Math.min(currentLeft + dx, screenWidth - MINI_WIDTH),
  )
  const newTop = Math.max(
    0,
    Math.min(currentTop + dy, screenHeight - MINI_HEIGHT),
  )

  return { left: newLeft, top: newTop }
}

type Props = {
  onDoubleTap: Function
  sourceObject: MediaStream
}

@observer
class Mini extends Component<Props> {
  panResponder: PanResponderInstance
  view: View | null = null
  private lastTap?: number
  private isDragging = false
  private startX = 0
  private startY = 0
  private startLeft = 0
  private startTop = 0

  constructor(props: Props) {
    super(props)
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: this.onDrag,
      onPanResponderRelease: this.onDrop,
      onPanResponderTerminate: this.onDrop,
    })
  }

  componentDidMount() {
    if (isWeb && this.view) {
      const el = this.view as any
      el.addEventListener('mousedown', this.onMouseDown)
      el.addEventListener('touchstart', this.onTouchStart)
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
      document.addEventListener('touchmove', this.onTouchMove)
      document.addEventListener('touchend', this.onTouchEnd)
    }
  }

  componentWillUnmount() {
    if (isWeb && this.view) {
      const el = this.view as any
      el.removeEventListener('mousedown', this.onMouseDown)
      el.removeEventListener('touchstart', this.onTouchStart)
      document.removeEventListener('mousemove', this.onMouseMove)
      document.removeEventListener('mouseup', this.onMouseUp)
      document.removeEventListener('touchmove', this.onTouchMove)
      document.removeEventListener('touchend', this.onTouchEnd)
    }
  }

  render() {
    return (
      <View
        ref={v => {
          this.view = v
        }}
        style={[
          css.Mini,
          {
            top: ctx.call.videoPositionT,
            left: ctx.call.videoPositionL,
          },
        ]}
        {...(!isWeb && this.panResponder.panHandlers)}
      >
        <VideoPlayer sourceObject={this.props.sourceObject} />
      </View>
    )
  }

  // Native (iOS/Android)
  onDrag = (_: GestureResponderEvent, g: PanResponderGestureState) => {
    const { left, top } = calculateBoundedPosition(
      ctx.call.videoPositionL,
      ctx.call.videoPositionT,
      g.dx,
      g.dy,
    )
    this.view?.setNativeProps({ style: { left, top } })
  }

  @action onDrop = (_: GestureResponderEvent, g: PanResponderGestureState) => {
    const { left, top } = calculateBoundedPosition(
      ctx.call.videoPositionL,
      ctx.call.videoPositionT,
      g.dx,
      g.dy,
    )
    Object.assign(ctx.call, { videoPositionL: left, videoPositionT: top })

    const n = Date.now()
    if (g.dx <= 10 && g.dy <= 10 && this.lastTap && n - this.lastTap <= 500) {
      this.props.onDoubleTap()
    }
    this.lastTap = n
  }

  // Web
  onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    this.startDrag(e.clientX, e.clientY)
  }

  onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) {
      return
    }
    e.preventDefault()
    this.moveDrag(e.clientX, e.clientY)
  }

  onMouseUp = (e: MouseEvent) => {
    if (!this.isDragging) {
      return
    }
    e.preventDefault()
    this.endDrag(e.clientX, e.clientY)
  }

  onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    this.startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  onTouchMove = (e: TouchEvent) => {
    if (!this.isDragging) {
      return
    }
    e.preventDefault()
    this.moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  onTouchEnd = (e: TouchEvent) => {
    if (!this.isDragging) {
      return
    }
    e.preventDefault()
    this.endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
  }

  startDrag = (x: number, y: number) => {
    this.isDragging = true
    this.startX = x
    this.startY = y
    this.startLeft = ctx.call.videoPositionL
    this.startTop = ctx.call.videoPositionT
  }

  moveDrag = (x: number, y: number) => {
    const { left, top } = calculateBoundedPosition(
      this.startLeft,
      this.startTop,
      x - this.startX,
      y - this.startY,
    )
    if (this.view) {
      const el = this.view as any
      el.style.left = `${left}px`
      el.style.top = `${top}px`
    }
  }

  @action endDrag = (x: number, y: number) => {
    const dx = x - this.startX
    const dy = y - this.startY
    const { left, top } = calculateBoundedPosition(
      this.startLeft,
      this.startTop,
      dx,
      dy,
    )

    Object.assign(ctx.call, { videoPositionL: left, videoPositionT: top })

    const n = Date.now()
    if (
      Math.abs(dx) <= 10 &&
      Math.abs(dy) <= 10 &&
      this.lastTap &&
      n - this.lastTap <= 500
    ) {
      this.props.onDoubleTap()
    }
    this.lastTap = n
    this.isDragging = false
  }
}

@observer
class Control extends Component<{ sourceObject: MediaStream }> {
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
