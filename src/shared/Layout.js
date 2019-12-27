import { observer } from 'mobx-react';
import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import authStore from '../global/authStore';
import { ScrollView, StatusBar, StyleSheet, View } from '../native/Rn';
import useStore from '../utils/useStore';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';

const css = StyleSheet.create({
  Layout: {
    flex: 1,
    height: `100%`,
    paddingBottom: getBottomSpace(),
  },
  Layout_Scroll: {
    flexGrow: 1,
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
      style: css.Layout,
    };
  } else {
    Container = ScrollView;
    containerProps = {
      style: css.Layout,
      contentContainerStyle: [css.Layout_Scroll],
      keyboardShouldPersistTaps: `always`,
      onScroll: e => {
        $.set(`headerOverflow`, e.nativeEvent.contentOffset.y > 60);
      },
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

  let headerSpace = 86 + 15;
  if (props.header?.navigation) {
    headerSpace += 35;
  }
  if (authStore.shouldShowConnStatus) {
    headerSpace += 20;
  }

  let footerSpace = getBottomSpace() + 15;
  if (props.footer?.navigation) {
    footerSpace += 48;
  }
  if (props.footer?.actions) {
    footerSpace += 60;
  }

  return (
    <React.Fragment>
      <Container {...containerProps}>
        <StatusBar transparent />
        <View style={{ height: headerSpace }} />
        {props.children}
        <View style={{ height: footerSpace }} />
      </Container>
      {props.footer && <LayoutFooter {...props.footer} />}
      {props.header && (
        <LayoutHeader {...props.header} compact={$.headerOverflow} />
      )}
    </React.Fragment>
  );
});

export default Layout;
