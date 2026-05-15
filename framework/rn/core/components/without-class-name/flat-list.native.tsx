/* eslint-disable no-restricted-imports */

import { FlatList } from 'react-native'
import Animated from 'react-native-reanimated'

import { isReanimated } from '@/rn/core/components/lib/is-reanimated'
import { normalizePropsNative } from '@/rn/core/components/lib/normalize-props-native'
import { renderReanimated } from '@/rn/core/components/lib/render-reanimated'
import type { FlatListPropsWocn } from '@/rn/core/components/without-class-name/flat-list'

export const FlatListWocn = (props: FlatListPropsWocn<any>) => {
  props = normalizePropsNative(props)
  const Component = isReanimated(props) ? Animated.FlatList : FlatList
  return renderReanimated(Component, props)
}
