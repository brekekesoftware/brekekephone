/* eslint-disable no-restricted-imports */

import { Animated } from 'react-native'

import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

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
