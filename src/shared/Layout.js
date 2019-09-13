import React, { useState } from 'react';

import { ScrollView, StatusBar, StyleSheet, View } from '../native/Rn';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';

const s = StyleSheet.create({
  Layout: {
    flex: 1,
    height: '100%',
  },
  Layout_Scroll: {
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
      style: s.Layout,
    };
  } else {
    Container = ScrollView;
    containerProps = {
      style: s.Layout,
      contentContainerStyle: [s.Layout_Scroll],
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
    <React.Fragment>
      <Container {...containerProps}>
        <StatusBar transparent />
        {p.header && <View style={s.Layout_HeaderSpacing} />}
        {p.children}
        {p.footer && <View style={s.Layout_FooterSpacing} />}
      </Container>
      {p.footer && <LayoutFooter {...p.footer} />}
      {p.header && <LayoutHeader {...p.header} compact={headerOverflow} />}
    </React.Fragment>
  );
};

export default Layout;
