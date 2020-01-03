import React, { useState } from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import Footer from '../Footer/Footer';
import g from '../global';
import Header from '../Header/Header';
import { ScrollView, StyleSheet, View } from '../native/Rn';

const css = StyleSheet.create({
  Layout: {
    flex: 1,
    height: `100%`,
  },
  Layout_Scroll: {
    flexGrow: 1,
  },
});

const Layout = props => {
  const [headerOverflow, setHeaderOverflow] = useState(false);
  //
  let Container = null;
  let containerProps = null;
  if (props.noScroll) {
    Container = View;
    containerProps = {
      style: css.Layout,
    };
  } else {
    Container = ScrollView;
    containerProps = {
      style: css.Layout,
      contentContainerStyle: [css.Layout_Scroll],
      keyboardShouldPersistTaps: `always`,
      onScroll: e =>
        // eslint-disable-next-line no-mixed-operators
        e.nativeEvent.contentOffset.y > 60 !== headerOverflow &&
        setHeaderOverflow(!headerOverflow),
      scrollEventThrottle: 170,
      showsVerticalScrollIndicator: false,
    };
    if (props.isChat) {
      let containerPropsChat = {
        ref: props.isChat.ref,
        onContentSizeChange: props.isChat.onContentSizeChange,
        onScroll: props.isChat.onScroll,
      };
      containerProps = { ...containerProps, ...containerPropsChat };
    }
  }
  //
  let headerSpace = 86 + 15;
  if (props.menu) {
    headerSpace += 35;
  }
  let footerSpace = getBottomSpace() + 15;
  if (props.menu && !g.isKeyboardShowing) {
    footerSpace += 48;
  }
  if (props.onFabNext || g.isKeyboardShowing) {
    footerSpace += 60;
  }
  //
  return (
    <React.Fragment>
      <Container {...containerProps}>
        <View style={{ height: headerSpace }} />
        {props.children}
      </Container>
      <View style={{ height: footerSpace }} />
      <Footer {...props} />
      <Header {...props} compact={props.compact || headerOverflow} />
    </React.Fragment>
  );
};

export default Layout;
