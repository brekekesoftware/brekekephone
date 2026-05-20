import { observer } from 'mobx-react'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { Platform } from 'react-native'

import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { lowerFirst } from '@/shared/lodash'
import { Footer } from '#/components/footer'
import { Header } from '#/components/header'
import type { HeaderDropdownItem } from '#/components/header-dropdown'
import { Toast } from '#/components/toast'
import { isAndroid } from '#/config'
import { RnKeyboard } from '#/stores/rn-keyboard'

// BUG-1220: Android 15+ (API 35+) doesn't shrink window for IME — ScrollView
// thinks content fits screen and refuses to scroll under keyboard. Add bottom
// padding equal to keyboard height so content becomes scrollable past the IME.
const shouldApplyKbPadding = isAndroid && Number(Platform.Version) >= 35

const DEFAULT_TOAST_MESSAGE = 'new message'

export const Layout: FC<
  Partial<{
    compact: boolean
    containerOnContentSizeChange: Function
    containerOnScroll: Function
    containerRef: Function
    description: string
    dropdown: HeaderDropdownItem[]
    fabOnBack(): void
    fabOnNext(): void
    fabOnNextText: string
    fabRender(): void
    menu: string
    noScroll: boolean
    onBack(): void
    onCreate(): void
    subMenu: string
    title: string
    transparent: boolean
    isTab: boolean
    isShowToastMessage: boolean
    incomingMessage: string
    children: ReactNode
    className?: ClassName
    isFullContent?: boolean
    iconRights?: string[]
    iconRightColors?: string[]
    iconRightFuncs?: Function[]
  }>
> = observer(originalProps => {
  const [headerOverflow, setHeaderOverflow] = useState(false)

  const props = { ...originalProps } // clone so it can be mutated
  const outerClassName = props.className // applied to outer View only
  delete props.className // don't leak className to Footer/Header via {...props}

  const Container = props.noScroll ? View : ScrollView
  const containerProps = Object.entries(props).reduce(
    (m, [k, vk]) => {
      type K = keyof typeof props
      if (k.startsWith('container')) {
        delete props[k as K]
        k = k.replace('container', '')
        k = lowerFirst(k)
        m[k] = vk as (typeof props)[K]
      }
      return m
    },
    {} as { [k: string]: unknown },
  )

  Object.assign(containerProps, {
    className: ['h-full flex-1', props.transparent ? 'bg-transparent' : 'bg-white'],
  })

  if (!props.noScroll) {
    containerProps.contentContainerClassName = 'grow'
    if (shouldApplyKbPadding && RnKeyboard.isKeyboardShowing) {
      containerProps.contentContainerStyle = {
        paddingBottom: RnKeyboard.keyboardHeight,
      }
    }
    containerProps.keyboardShouldPersistTaps = 'always'
    containerProps.onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newHeaderOverflow = e.nativeEvent.contentOffset.y > 60
      if (newHeaderOverflow !== headerOverflow) {
        setHeaderOverflow(newHeaderOverflow)
      }
      originalProps.containerOnScroll?.(e)
    }
    containerProps.scrollEventThrottle = 16
    containerProps.showsVerticalScrollIndicator = false
  }

  if (props.compact) {
    // fix android header transparent box shadow
    props.transparent = false
  }

  // TODO: put more document here
  let headerSpace = 86 + 15
  if (props.menu) {
    headerSpace += 35
  }
  if (props.compact) {
    headerSpace -= 46
  }
  // TODO: put more document here
  let footerSpace = 0
  if (props.fabRender) {
    footerSpace += 40
  } else if (!RnKeyboard.isKeyboardShowing) {
    if (props.menu) {
      footerSpace += 48
    }
    if (props.fabOnNext) {
      footerSpace += 56
    }
  }

  const headerSpaceH = props?.isFullContent ? headerSpace - 15 : headerSpace
  const headerSpaceCls = `h-[${headerSpaceH}px]`
  const footerSpaceCls = `h-[${footerSpace}px]`
  const cl = outerClassName ? outerClassName : 'h-full w-full'
  return (
    <View className={cl}>
      <Container {...containerProps}>
        <View className={headerSpaceCls} />
        {props.children}
        <View className={props?.isFullContent ? 'h-0' : 'h-3.75'} />
      </Container>
      {props.isShowToastMessage && (
        <Toast
          isVisible
          title={props.incomingMessage || DEFAULT_TOAST_MESSAGE}
          containerClassName='bg-warning'
          containerMarginTop={headerSpace}
        />
      )}
      {!props.isTab && <View className={footerSpaceCls} />}
      <Footer {...props} menu={props.menu as string} />
      <Header {...props} compact={props.compact || headerOverflow} />
    </View>
  )
})
