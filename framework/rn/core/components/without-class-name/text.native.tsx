/* eslint-disable no-restricted-imports */

import { Text } from 'react-native'
import Animated from 'react-native-reanimated'

import { isReanimated } from '@/rn/core/components/lib/is-reanimated'
import { normalizePropsNative } from '@/rn/core/components/lib/normalize-props-native'
import { renderReanimated } from '@/rn/core/components/lib/render-reanimated'
import type { TextPropsWocn } from '@/rn/core/components/without-class-name/text'

const styleProps = ['numberOfLines', 'selectable']

export const TextWocn = (props: TextPropsWocn) => {
  props = normalizePropsNative(props, styleProps)
  const Component = isReanimated(props) ? Animated.Text : Text

  return renderReanimated(Component, {
    suppressHighlighting: true,
    ...props,
  })
}
