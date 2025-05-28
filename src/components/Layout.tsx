import { lowerFirst } from 'lodash'
import { observer } from 'mobx-react'
import type { FC, ReactNode } from 'react'
import { useState } from 'react'
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { ScrollView, StyleSheet, View } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import { RnKeyboard } from '../stores/RnKeyboard'
import { Footer } from './Footer'
import { Header } from './Header'
import type { HeaderDropdownItem } from './HeaderDropdown'
import { Toast } from './Toast'
import { v } from './variables'

const DEFAULT_TOAST_MESSAGE = 'new message'

const css = StyleSheet.create({
  FullScreen: {
    width: '100%',
    height: '100%',
  },
  Layout: {
    flex: 1,
    height: '100%',
    backgroundColor: 'white',
  },
  Layout__transparent: {
    backgroundColor: 'transparent',
  },
  Scroller: {
    flexGrow: 1,
  },
  FooterSpaceInsideScroller: {
    height: 15,
  },
  FooterSpaceFullContent: {
    height: 0,
  },
  LoadMore: {
    alignSelf: 'center',
    paddingBottom: 15,
    fontSize: v.fontSizeSmall,
    paddingHorizontal: 10,
  },
  LoadMore__btn: {
    color: v.colors.primary,
  },
  LoadMore__finished: {
    color: v.colors.warning,
  },
})

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
    style?: StyleProp<ViewStyle>
    isFullContent?: boolean
    iconRights?: string[]
    iconRightColors?: string[]
    iconRightFuncs?: Function[]
  }>
> = observer(originalProps => {
  const [headerOverflow, setHeaderOverflow] = useState(false)

  const props = { ...originalProps } // clone so it can be mutated

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
    style: [css.Layout, props.transparent && css.Layout__transparent],
  })

  if (!props.noScroll) {
    containerProps.contentContainerStyle = [css.Scroller]
    containerProps.keyboardShouldPersistTaps = 'always'
    containerProps.onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newHeaderOverflow = e.nativeEvent.contentOffset.y > 60
      if (newHeaderOverflow !== headerOverflow) {
        setHeaderOverflow(newHeaderOverflow)
      }
      originalProps.containerOnScroll?.(e)
    }
    containerProps.scrollEventThrottle = 170
    containerProps.showsVerticalScrollIndicator = false
  }

  if (props.compact) {
    // fix android header transparent box shadow
    props.transparent = false
  }

  // TODO put more document here
  let headerSpace = 86 + 15
  if (props.menu) {
    headerSpace += 35
  }
  if (props.compact) {
    headerSpace -= 46
  }
  // TODO put more document here
  let footerSpace = getBottomSpace()
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

  return (
    <View style={[css.FullScreen, props.style]}>
      <Container {...containerProps}>
        <View
          style={{
            height: props?.isFullContent ? headerSpace - 15 : headerSpace,
          }}
        />
        {props.children}
        <View
          style={
            props?.isFullContent
              ? css.FooterSpaceFullContent
              : css.FooterSpaceInsideScroller
          }
        />
      </Container>
      {props.isShowToastMessage && (
        <Toast
          isVisible={props.isShowToastMessage}
          title={props.incomingMessage || DEFAULT_TOAST_MESSAGE}
          containerStyles={{
            marginTop: headerSpace,
            backgroundColor: 'yellow',
          }}
        />
      )}
      {!props.isTab && <View style={{ height: footerSpace }} />}
      {<Footer {...props} menu={props.menu as string} />}
      <Header {...props} compact={props.compact || headerOverflow} />
    </View>
  )
})
