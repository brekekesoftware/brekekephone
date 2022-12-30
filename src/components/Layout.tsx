import { lowerFirst } from 'lodash'
import { observer } from 'mobx-react'
import { FC, useState } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import { RnKeyboard } from '../stores/RnKeyboard'
import { Footer } from './Footer'
import { Header } from './Header'
import { HeaderDropdownItem } from './HeaderDropdown'
import { Toast } from './Toast'
import { v } from './variables'

const DEFAULT_TOAST_MESSAGE = 'new message'

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
    isShowToastMessage?: boolean
    incomingMessage: string
  }>
> = observer(originalProps => {
  const [headerOverflow, setHeaderOverflow] = useState(false)

  const props = { ...originalProps } // Clone so it can be mutated

  const Container = props.noScroll ? View : ScrollView
  const containerProps = Object.entries(props).reduce((m, [k, vk]) => {
    type K = keyof typeof props
    if (k.startsWith('container')) {
      delete props[k as K]
      k = k.replace('container', '')
      k = lowerFirst(k)
      m[k] = vk as typeof props[K]
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
        originalProps.containerOnScroll?.(e)
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

  return (
    <>
      <Container {...containerProps}>
        <View style={{ height: headerSpace }} />
        {props.children}
        <View style={css.FooterSpaceInsideScroller} />
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
    </>
  )
})
