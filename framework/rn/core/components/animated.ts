/* eslint-disable no-restricted-imports */

import { Animated } from 'react-native'

import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

/*
  Wraps RN Animated components qua createClassNameComponent để support className.
  - createClassNameComponent normalize className (qua clsx) thành string ở runtime
  - Vẫn nhận `style` prop cho Animated interpolated values (transform, opacity, ...)

  Usage:
  - Static styling: className='absolute inset-0 bg-modal-overlay'
  - Dynamic animated values: style={{ opacity: fadeAnim, transform: [{ translateY: y }] }}
  - Combine: className='absolute' style={{ opacity: fadeAnim }}

  Note: Plain `AnimatedText` here only supports className. Apps that need
  typography variants (title/small/white/...) should wrap this further at
  app-level — see `apps/brekekephone/app/src/components/rn-text.tsx` for
  the variant-aware version that re-uses this plain wrapper.
*/

export const AnimatedView = createClassNameComponent({
  AnimatedViewWocn: Animated.View,
})

export const AnimatedScrollView = createClassNameComponent({
  AnimatedScrollViewWocn: Animated.ScrollView,
})

export const AnimatedImage = createClassNameComponent({
  AnimatedImageWocn: Animated.Image,
})

export const AnimatedText = createClassNameComponent({
  AnimatedTextWocn: Animated.Text,
})
