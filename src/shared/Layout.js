import React, { Fragment, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';

const s = StyleSheet.create({
  Layout: {
    position: 'absolute',
    top: 0,
    bottom: 71,
    left: 0,
    right: 0,
    padding: 15,
    paddingTop: 100,
  },
  Layout__noHeader: {
    paddingTop: 15,
    top: 0,
  },
  Layout__noFooter: {
    bottom: 0,
  },
  Layout_Inner: {
    flexGrow: 1,
  },
});

const Layout = p => {
  const [headerOverflow, setOverflow] = useState(false);
  return (
    <Fragment>
      <ScrollView
        style={[
          s.Layout,
          !p.header && s.Layout__noHeader,
          !p.footer && s.Layout__noFooter,
        ]}
        contentContainerStyle={s.Layout_Inner}
        onScroll={e => {
          setOverflow(e.nativeEvent.contentOffset.y > 60);
        }}
        scrollEventThrottle={17}
        showsVerticalScrollIndicator={false}
      >
        {p.children}
      </ScrollView>
      {p.footer && <LayoutFooter {...p.footer} />}
      {p.header && <LayoutHeader {...p.header} compact={headerOverflow} />}
    </Fragment>
  );
};

export default Layout;
