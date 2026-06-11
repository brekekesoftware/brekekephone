import type { ViewRn } from '@rntwsc/rn/core/components/view'
import { View } from '@rntwsc/rn/core/components/view'
import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import type {
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native'
import { Dimensions, PanResponder } from 'react-native'

import { VideoPlayer } from '#/components/video-player'
import { ctx } from '#/stores/ctx'
import { RnStacker } from '#/stores/rn-stacker'

const MINI_WIDTH = 150
const MINI_HEIGHT = 150

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

  return {
    left: newLeft,
    top: newTop,
  }
}

type Props = {
  onDoubleTap: Function
  sourceObject: MediaStream
}

const Mini = observer(({ onDoubleTap, sourceObject }: Props) => {
  const viewRef = useRef<ViewRn | null>(null)
  const lastTapRef = useRef<number | undefined>(undefined)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startLeftRef = useRef(0)
  const startTopRef = useRef(0)

  // Native (iOS/Android)
  const onDrag = (_: GestureResponderEvent, g: PanResponderGestureState) => {
    const { left, top } = calculateBoundedPosition(
      ctx.call.videoPositionL,
      ctx.call.videoPositionT,
      g.dx,
      g.dy,
    )
    viewRef.current?.setNativeProps({
      style: {
        left,
        top,
      },
    })
  }

  const onDrop = (_: GestureResponderEvent, g: PanResponderGestureState) => {
    const { left, top } = calculateBoundedPosition(
      ctx.call.videoPositionL,
      ctx.call.videoPositionT,
      g.dx,
      g.dy,
    )
    Object.assign(ctx.call, {
      videoPositionL: left,
      videoPositionT: top,
    })

    const n = Date.now()
    if (
      g.dx <= 10 &&
      g.dy <= 10 &&
      lastTapRef.current &&
      n - lastTapRef.current <= 500
    ) {
      onDoubleTap()
    }
    lastTapRef.current = n
  }

  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (...args) => onDragRef.current(...args),
      onPanResponderRelease: (...args) => onDropRef.current(...args),
      onPanResponderTerminate: (...args) => onDropRef.current(...args),
    }),
  ).current

  useEffect(() => {
    if (!isWeb || !viewRef.current) {
      return
    }
    const el = viewRef.current as any
    // web-only CSS not expressible via tailwind className:
    // position fixed (anchor to viewport - RNW defaults every View to
    // relative) and touch-action none (block page scroll while dragging)
    el.style.position = 'fixed'
    el.style.touchAction = 'none'

    const startDrag = (x: number, y: number) => {
      isDraggingRef.current = true
      startXRef.current = x
      startYRef.current = y
      startLeftRef.current = ctx.call.videoPositionL
      startTopRef.current = ctx.call.videoPositionT
    }

    const moveDrag = (x: number, y: number) => {
      const { left, top } = calculateBoundedPosition(
        startLeftRef.current,
        startTopRef.current,
        x - startXRef.current,
        y - startYRef.current,
      )
      if (viewRef.current) {
        const elInner = viewRef.current as any
        elInner.style.left = `${left}px`
        elInner.style.top = `${top}px`
      }
    }

    const endDrag = (x: number, y: number) => {
      const dx = x - startXRef.current
      const dy = y - startYRef.current
      const { left, top } = calculateBoundedPosition(
        startLeftRef.current,
        startTopRef.current,
        dx,
        dy,
      )

      Object.assign(ctx.call, {
        videoPositionL: left,
        videoPositionT: top,
      })

      const n = Date.now()
      if (
        Math.abs(dx) <= 10 &&
        Math.abs(dy) <= 10 &&
        lastTapRef.current &&
        n - lastTapRef.current <= 500
      ) {
        onDoubleTap()
      }
      lastTapRef.current = n
      isDraggingRef.current = false
    }

    // Web
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      startDrag(e.clientX, e.clientY)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        return
      }
      e.preventDefault()
      moveDrag(e.clientX, e.clientY)
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        return
      }
      e.preventDefault()
      endDrag(e.clientX, e.clientY)
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      startDrag(e.touches[0].clientX, e.touches[0].clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) {
        return
      }
      e.preventDefault()
      moveDrag(e.touches[0].clientX, e.touches[0].clientY)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current) {
        return
      }
      e.preventDefault()
      endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('touchstart', onTouchStart)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, []) // empty deps - runs once on mount

  return (
    <View
      ref={viewRef}
      className='bg-foreground android:elevation-999 native:absolute web:cursor-move web:select-none z-999 h-37.5 w-37.5 overflow-hidden rounded-full shadow-sm'
      style={{
        top: ctx.call.videoPositionT,
        left: ctx.call.videoPositionL,
      }}
      {...(!isWeb && panResponder.panHandlers)}
    >
      <VideoPlayer sourceObject={sourceObject} />
    </View>
  )
})

const Control = observer((props: { sourceObject: MediaStream }) => {
  const s = RnStacker.stacks[RnStacker.stacks.length - 1]
  if (
    ctx.call.inPageCallManage ||
    s.name === 'PageCallTransferDial' ||
    s.name === 'PageCallTransferAttend'
  ) {
    return null
  }
  return <Mini {...props} onDoubleTap={ctx.nav.goToPageCallManage} />
})

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
