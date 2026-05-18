import { bounce, ping, pulse, spin } from 'react-native-css-animations'
import type {
  CSSAnimationProperties,
  CSSTransitionTimingFunction,
} from 'react-native-reanimated'

import type { StrMap } from '@/shared/ts-utils'

export * from '@/rn/core/tw/lib/normalize-style-config-shared'

export const transitionTimingFunctionMap: StrMap<CSSTransitionTimingFunction> =
  {
    // custom transtion timing function here
  }

export const animationMap: StrMap<CSSAnimationProperties> = {
  // built in tailwind animation
  spin,
  ping,
  pulse,
  bounce,
  // custom animation here
}
