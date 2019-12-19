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
  Layout_HeaderSpacing: {
    height: 128,
  },
  Layout_HeaderSpacing__withConnStatus: {
    height: 148,
  },
  Layout_FooterSpacing: {
    height: getBottomSpace() + 71, // 56+15
  },
  Layout_FooterSpacing__hasKeyPad: {
    height: getBottomSpace(), // 56+15
  },
  Layout_FooterSpacing__hasInputChat: {
    height: getBottomSpace() + 127, // 56*2+15
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
  return (
    <React.Fragment>
      <Container {...containerProps}>
        <StatusBar transparent />
        {props.header && (
          <View
            style={[
              css.Layout_HeaderSpacing,
              authStore.shouldShowConnStatus &&
                css.Layout_HeaderSpacing__withConnStatus,
            ]}
          />
        )}
        {props.children}
        {props.footer && (
          <View
            style={[
              css.Layout_FooterSpacing,
              (props.footer.LayoutChat ||
                props.footer.Phonebook ||
                (props.footer.actions && props.footer.navigation)) &&
                css.Layout_FooterSpacing__hasInputChat,
              props.footer.KeyPad && css.Layout_FooterSpacing__hasKeyPad,
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
