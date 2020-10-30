import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import Footer from '../Footer'
import RnKeyboard from '../global/RnKeyboard'
import Header from '../Header'
import { toLowerCaseFirstChar } from '../utils/string'

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
})

const Layout = observer(props => {
  const [headerOverflow, setHeaderOverflow] = useState(false)

  props = { ...props } // Clone so it can be mutated

  const Container = props.noScroll ? View : ScrollView
  const containerProps = Object.entries(props).reduce((m, [k, v]) => {
    if (k.startsWith('container')) {
      delete props[k]
      k = k.replace('container', '')
      k = toLowerCaseFirstChar(k)
      m[k] = v
    }
    return m
  }, {})

  Object.assign(containerProps, {
    style: [css.Layout, props.transparent && css.Layout__transparent],
  })

  if (!props.noScroll) {
    Object.assign(containerProps, {
      contentContainerStyle: [css.Scroller],
      keyboardShouldPersistTaps: 'always',
      onScroll: e =>
        // eslint-disable-next-line no-mixed-operators
        e.nativeEvent.contentOffset.y > 60 !== headerOverflow &&
        setHeaderOverflow(!headerOverflow),
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
    <React.Fragment>
      <Container {...containerProps}>
        <View style={{ height: headerSpace }} />
        {props.children}
        <View style={css.FooterSpaceInsideScroller} />
      </Container>
      <View style={{ height: footerSpace }} />
      <Footer {...props} />
      <Header {...props} compact={props.compact || headerOverflow} />
    </React.Fragment>
  )
})

export default Layout
