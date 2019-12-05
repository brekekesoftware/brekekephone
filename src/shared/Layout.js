import { observer } from 'mobx-react';
import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import authStore from '../-/authStore';
import { ScrollView, StatusBar, StyleSheet, View } from '../native/Rn';
import LayoutFooter from './LayoutFooter';
import LayoutHeader from './LayoutHeader';
import useStore from './useStore';

const s = StyleSheet.create({
  Layout: {
    flex: 1,
    height: `100%`,
    paddingBottom: getBottomSpace(),
  },
  Layout_Scroll: {
    flexGrow: 1,
  },
  Layout_HeaderSpacing: {
    height: 128,
  },
  Layout_HeaderSpacing__withConnStatus: {
    height: 148,
  },
  Layout_FooterSpacing: {
    height: 71, // 56+15
  },
  Layout_FooterSpacing__hasInputChat: {
    height: 127, // 56*2+15
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
    if (props.isChat) {
      let containerPropsChat = {
        ref: props.isChat.ref,
        onContentSizeChange: props.isChat.onContentSizeChange,
        onScroll: props.isChat.onScroll,
      };
      containerProps = { ...containerProps, ...containerPropsChat };
    }
  }
  return (
    <React.Fragment>
      <Container {...containerProps}>
        <StatusBar transparent />
        {props.header && (
          <View
            style={[
              s.Layout_HeaderSpacing,
              authStore.shouldShowConnStatus &&
                s.Layout_HeaderSpacing__withConnStatus,
            ]}
          />
        )}
        {props.children}
        {props.footer && (
          <View
            style={[
              s.Layout_FooterSpacing,
              props.footer.LayoutChat && s.Layout_FooterSpacing__hasInputChat,
              props.footer.PhoneBook && s.Layout_FooterSpacing__hasInputChat,
            ]}
          />
        )}
      </Container>
      {props.footer && <LayoutFooter {...props.footer} />}
      {props.header && (
        <LayoutHeader {...props.header} compact={$.headerOverflow} />
      )}
    </React.Fragment>
  );
});

export default Layout;
