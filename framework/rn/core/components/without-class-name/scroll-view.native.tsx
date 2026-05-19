/* eslint-disable no-restricted-imports */

import { ScrollView } from 'react-native'
import Animated from 'react-native-reanimated'

import { isReanimated } from '@/rn/core/components/lib/is-reanimated'
import { normalizePropsNative } from '@/rn/core/components/lib/normalize-props-native'
import { renderReanimated } from '@/rn/core/components/lib/render-reanimated'
import type { ScrollViewPropsWocn } from '@/rn/core/components/without-class-name/scroll-view'

export const ScrollViewWocn = (props: ScrollViewPropsWocn) => {
  props = normalizePropsNative(props)
  const Component = isReanimated(props) ? Animated.ScrollView : ScrollView
  return renderReanimated(Component, props)
}
