/* eslint-disable no-restricted-imports */

import { Children, useState } from 'react'
import type { LayoutChangeEvent, ViewStyle } from 'react-native'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'

import { isReanimated } from '@/rn/core/components/lib/is-reanimated'
import { normalizePropsNative } from '@/rn/core/components/lib/normalize-props-native'
import { renderReanimated } from '@/rn/core/components/lib/render-reanimated'
import type { ViewPropsWocn } from '@/rn/core/components/without-class-name/view'
import type { GridStyle, GridTrack } from '@/rn/core/tw/class-name'

export const ViewWocn = (props: ViewPropsWocn) => {
  props = normalizePropsNative(props)
  const Component = isReanimated(props) ? Animated.View : View
  const { style } = props
  const rawStyle = style as GridStyle | undefined
  if (!rawStyle) {
    return renderReanimated(Component, props)
  }

  const { grid, gridCols, ...styleWithoutGrid } = rawStyle
  props = {
    ...props,
    style: styleWithoutGrid,
  }
  if (!grid || !gridCols) {
    return renderReanimated(Component, props)
  }

  const gridStyle = {
    gridCols,
    gap: styleWithoutGrid.gap,
    columnGap: styleWithoutGrid.columnGap,
    rowGap: styleWithoutGrid.rowGap,
  }
  delete styleWithoutGrid.gap
  delete styleWithoutGrid.columnGap
  delete styleWithoutGrid.rowGap
  return <Grid props={props} grid={gridStyle} />
}

type GridProps = {
  props: any
  grid: GridStyle
}

const Grid = ({
  props: { style, children, onLayout, ...props },
  grid: { gridCols, gap, columnGap: colGap, rowGap },
}: GridProps) => {
  gridCols = (
    typeof gridCols === 'number'
      ? Array.from({ length: gridCols }).fill({ fr: 1 })
      : gridCols
  ) as GridTrack[]
  const totalCols = gridCols.length
  colGap = number(colGap, gap)
  rowGap = number(rowGap, gap)

  const [w, setW] = useState(0)
  const onLayoutComposed = (e: LayoutChangeEvent) => {
    onLayout?.(e)
    const nextW = Math.floor(e.nativeEvent.layout.width)
    if (nextW === w) {
      // float jitter
      return
    }
    setW(nextW)
  }

  const padding = number(style.padding)
  const pl = number(style.paddingLeft) || padding
  const pr = number(style.paddingRight) || padding
  const pt = number(style.paddingTop) || padding
  const pb = number(style.paddingBottom) || padding

  const border = number(style.border)
  const bl = number(style.borderLeft) || border
  const br = number(style.borderRight) || border
  const bt = number(style.borderTop) || border
  const bb = number(style.borderBottom) || border

  const containerStyle: ViewStyle = {
    ...style,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: pl,
    paddingRight: pr,
    paddingTop: pt,
    paddingBottom: pb,
    borderLeft: bl,
    borderRight: br,
    borderTop: bt,
    borderBottom: bb,
  }

  const innerW = Math.max(0, w - pl - pr - bl - br)
  const hasMeasured = innerW > 0

  // fixed px sum + total fr units
  const pxSum = gridCols.reduce((s, t) => s + ('px' in t ? t.px : 0), 0)
  const frSum = gridCols.reduce((s, t) => s + ('fr' in t ? t.fr : 0), 0)

  const totalColGap = colGap * Math.max(0, totalCols - 1)
  const remaining = Math.max(0, innerW - totalColGap - pxSum)

  // px tracks are exact, fr tracks are proportional from remaining
  const floats = gridCols.map(t => {
    if ('px' in t) {
      return t.px
    }
    if ('fr' in t) {
      return frSum > 0 ? (remaining * t.fr) / frSum : 0
    }
    return 0
  })

  // float widths -> integer widths with deterministic remainder distribution
  // sum(ints) == pxSum + remaining (innerW - totalColGap)
  const target = pxSum + remaining
  const ints = floats.map(x => Math.floor(x))
  let deficit = target - ints.reduce((a, b) => a + b, 0)

  // distribute +1px to columns with largest fractional part first
  const fracRank = floats
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac)

  for (let i = 0; i < totalCols && deficit > 0; i++) {
    ints[fracRank[i].i] += 1
    deficit -= 1
  }

  const arr = Children.toArray(children).filter(
    c => c !== null && c !== undefined && typeof c !== 'boolean',
  )
  const totalRows = Math.ceil(arr.length / totalCols)

  const wrapped = arr.map((child, i) => {
    const col = i % totalCols
    const row = Math.floor(i / totalCols)
    const childW = ints[col] || 0
    const childStyle: ViewStyle = {
      width: hasMeasured ? childW : 0,
      marginRight: col === totalCols - 1 ? undefined : colGap,
      marginBottom: row === totalRows - 1 ? undefined : rowGap,
    }
    return (
      <ViewWocn key={i} style={childStyle}>
        {child}
      </ViewWocn>
    )
  })

  return (
    <ViewWocn {...props} style={containerStyle} onLayout={onLayoutComposed}>
      {wrapped}
    </ViewWocn>
  )
}

const number = (...args: unknown[]) => {
  const n = args.find(v => typeof v === 'number')
  return typeof n === 'number' ? n : 0
}
