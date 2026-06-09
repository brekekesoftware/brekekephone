import type { ComponentProps, FC } from 'react'
import {
  ActivityIndicator as ActivityIndicatorWocn,
  Animated,
  KeyboardAvoidingView as KeyboardAvoidingViewWocn,
} from 'react-native'
import FastImageWocn from 'react-native-fast-image'
import LinearGradientWocn from 'react-native-linear-gradient'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export const RnFastImage = createClassNameComponent({ FastImageWocn }) as FC<
  ComponentProps<typeof FastImageWocn> & { className?: ClassName }
>

export const RnLinearGradient = createClassNameComponent({
  LinearGradientWocn,
}) as FC<ComponentProps<typeof LinearGradientWocn> & { className?: ClassName }>

export const RnActivityIndicator = createClassNameComponent({
  ActivityIndicatorWocn,
}) as FC<
  ComponentProps<typeof ActivityIndicatorWocn> & { className?: ClassName }
>

export const RnKeyboardAvoidingView = createClassNameComponent({
  KeyboardAvoidingViewWocn,
}) as FC<
  ComponentProps<typeof KeyboardAvoidingViewWocn> & { className?: ClassName }
>

export const AnimatedView = createClassNameComponent({
  AnimatedViewWocn: Animated.View,
}) as FC<ComponentProps<typeof Animated.View> & { className?: ClassName }>

export const AnimatedScrollView = createClassNameComponent({
  AnimatedScrollViewWocn: Animated.ScrollView,
}) as FC<ComponentProps<typeof Animated.ScrollView> & { className?: ClassName }>

export const AnimatedImage = createClassNameComponent({
  AnimatedImageWocn: Animated.Image,
}) as FC<ComponentProps<typeof Animated.Image> & { className?: ClassName }>

export const AnimatedText = createClassNameComponent({
  AnimatedTextWocn: Animated.Text,
}) as FC<ComponentProps<typeof Animated.Text> & { className?: ClassName }>
