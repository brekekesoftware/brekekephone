import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import { RnKeyboard } from '../stores/RnKeyboard'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { toLowerCaseFirstChar } from '../utils/string'
import { Footer } from './Footer'
import { Header } from './Header'
import { HeaderDropdownItem } from './HeaderDropdown'
import { RnText } from './RnText'
import { v } from './variables'

const css = StyleSheet.create({
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
  showBubbleMessage: {
    position: 'absolute',
    top: 140,
    left: 100,
    zIndex: 100,
    // height: 40,
    // width: 40,
    backgroundColor: 'red',
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
    isTab?: boolean
    showBubbleMessage?: string
  }>
> = observer(props => {
  const [headerOverflow, setHeaderOverflow] = useState(false)

  props = { ...props } // Clone so it can be mutated

  const Container = props.noScroll ? View : ScrollView
  const containerProps = Object.entries(props).reduce((m, [k, v]) => {
    type K = keyof typeof props
    if (k.startsWith('container')) {
      delete props[k as K]
      k = k.replace('container', '')
      k = toLowerCaseFirstChar(k)
      m[k] = v as typeof props[K]
    }
    return m
  }, {} as { [k: string]: unknown })

  Object.assign(containerProps, {
    style: [css.Layout, props.transparent && css.Layout__transparent],
  })

  if (!props.noScroll) {
    Object.assign(containerProps, {
      contentContainerStyle: [css.Scroller],
      keyboardShouldPersistTaps: 'always',
      onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        // eslint-disable-next-line no-mixed-operators
        if (e.nativeEvent.contentOffset.y > 60 !== headerOverflow) {
          setHeaderOverflow(!headerOverflow)
        }
        props.containerOnScroll?.(e)
      },
      scrollEventThrottle: 170,
      showsVerticalScrollIndicator: false,
    })
  }

  if (props.compact) {
    // Fix android header transparent box shadow
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
  const renderBubbleMessage = () => {
    BackgroundTimer.setTimeout(() => {
      return
    }, 3000)
    return (
      <View style={css.showBubbleMessage}>
        <RnText center style={[css.LoadMore, css.LoadMore__finished]}>
          {props?.showBubbleMessage}
        </RnText>
      </View>
    )
  }
  return (
    <>
      <Container {...containerProps}>
        <View style={{ height: headerSpace }} />
        {props.children}
        <View style={css.FooterSpaceInsideScroller} />
      </Container>
      {props?.showBubbleMessage ? renderBubbleMessage() : null}
      {!props.isTab && <View style={{ height: footerSpace }} />}
      {<Footer {...props} menu={props.menu as string} />}
      <Header {...props} compact={props.compact || headerOverflow} />
    </>
  )
})
