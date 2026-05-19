/* eslint-disable no-restricted-imports */

import { Pressable } from 'react-native'
import { createAnimatedComponent } from 'react-native-reanimated'

import { isReanimated } from '@/rn/core/components/lib/is-reanimated'
import { normalizePropsNative } from '@/rn/core/components/lib/normalize-props-native'
import { renderReanimated } from '@/rn/core/components/lib/render-reanimated'
import type { PressablePropsWocn } from '@/rn/core/components/without-class-name/pressable'

export const PressableWocn = (props: PressablePropsWocn) => {
  props = normalizePropsNative(props)
  const Component = isReanimated(props) ? AnimatedPressable : Pressable
  return renderReanimated(Component, props)
}

const AnimatedPressable = createAnimatedComponent(Pressable)
