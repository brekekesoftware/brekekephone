import React from 'react';
import { StyleSheet, View } from 'react-native';

import v from '../variables';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';

const s = StyleSheet.create({
  Layout: {
    padding: 15,
    flex: 1,
  },
  Layout__noPadding: {
    padding: 0,
  },
  Layout_HeaderSpace: {
    height: 100,
  },
  Layout_FooterSpace: {
    height: 60,
  },
});

const Layout = p => (
  <View style={[s.Layout, p.noPadding && s.Layout__noPadding]}>
    {p.header && <View style={s.Layout_HeaderSpace} />}
    {p.children}
    {p.footer && <View style={s.Layout_FooterSpace} />}
    {p.footer && <LayoutFooter {...p.footer} />}
    {p.header && <LayoutHeader {...p.header} />}
  </View>
);

export default Layout;
