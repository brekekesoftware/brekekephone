import React, { useState } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { ScrollView, StatusBar, StyleSheet, View } from '../native/Rn';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';

const s = StyleSheet.create({
  Layout: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  Layout_Outer: {
    flex: 1,
  },
  Layout_Inner: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
  },
  Layout_InnerScroll: {
    flexGrow: 1,
  },
  Layout_HeaderSpacing: {
    height: 94, // 79+15
  },
  Layout_FooterSpacing: {
    height: 71, // 56+15
  },
});

const Layout = p => {
  const [headerOverflow, setOverflow] = useState(false);
  let Container = null;
  let containerProps = null;
  if (p.noScroll) {
    Container = View;
    containerProps = {
      style: s.Layout_Inner,
    };
  } else {
    Container = ScrollView;
    containerProps = {
      style: s.Layout_Inner,
      contentContainerStyle: [s.Layout_InnerScroll],
      onScroll: e => {
        const o = e.nativeEvent.contentOffset.y > 60;
        if (o !== headerOverflow) {
          setOverflow(o);
        }
      },
      scrollEventThrottle: 170,
      showsVerticalScrollIndicator: false,
    };
  }
  return (
    <View style={s.Layout}>
      <View style={s.Layout_Outer}>
        <Container {...containerProps}>
          <StatusBar transparent />
          {p.header && <View style={s.Layout_HeaderSpacing} />}
          {p.children}
          {p.footer && <View style={s.Layout_FooterSpacing} />}
        </Container>
        {p.footer && <LayoutFooter {...p.footer} />}
        {p.header && <LayoutHeader {...p.header} compact={headerOverflow} />}
      </View>
      <KeyboardSpacer />
    </View>
  );
};

export default Layout;
