import { observer } from 'mobx-react';
import React from 'react';

import { ScrollView, StatusBar, StyleSheet, View } from '../native/Rn';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';
import useStore from './useStore';

const s = StyleSheet.create({
  Layout: {
    flex: 1,
    height: `100%`,
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

const Layout = observer(props => {
  const $ = useStore(() => ({
    observable: {
      headerOverflow: false,
    },
  }));
  let Container = null;
  let containerProps = null;
  if (props.noScroll) {
    Container = View;
    containerProps = {
      style: s.Layout,
    };
  } else {
    Container = ScrollView;
    containerProps = {
      style: s.Layout,
      contentContainerStyle: [s.Layout_Scroll],
      keyboardShouldPersistTaps: `always`,
      onScroll: e => {
        $.set(`headerOverflow`, e.nativeEvent.contentOffset.y > 60);
      },
      scrollEventThrottle: 170,
      showsVerticalScrollIndicator: false,
    };
  }
  return (
    <React.Fragment>
      <Container {...containerProps}>
        <StatusBar transparent />
        {props.header && <View style={s.Layout_HeaderSpacing} />}
        {props.children}
        {props.footer && <View style={s.Layout_FooterSpacing} />}
      </Container>
      {props.footer && <LayoutFooter {...props.footer} />}
      {props.header && (
        <LayoutHeader {...props.header} compact={$.headerOverflow} />
      )}
    </React.Fragment>
  );
});

export default Layout;
