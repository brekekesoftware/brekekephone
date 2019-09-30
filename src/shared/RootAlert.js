import flow from 'lodash/flow';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

import g from '../global';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import useStore from './useStore';

const s = StyleSheet.create({
  RootAlert: {
    alignItems: `center`,
    justifyContent: `center`,
  },
  RootAlert_Backdrop: {
    backgroundColor: g.layerBg,
  },
  RootAlert_Modal: {
    width: `90%`,
    maxWidth: g.maxModalWidth,
    borderRadius: g.borderRadius,
    padding: 15,
    backgroundColor: g.bg,
    ...g.boxShadow,
  },
  RootAlert_Message: {
    marginTop: 15,
  },
  RootAlert_Err: {
    alignSelf: `flex-start`,
  },
  RootAlert_ErrTxt: {
    color: g.redDarkBg,
    fontWeight: g.fontWeight,
  },
  RootAlert_ErrTxt__title: {
    fontWeight: `bold`,
  },
  RootAlert_Btns: {
    alignSelf: `flex-end`,
    flexDirection: `row`,
    top: 5,
    left: 5,
    marginTop: 15,
  },
  RootAlert_Btn: {
    borderRadius: g.borderRadius,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: g.mainDarkBg,
    width: 100,
  },
  RootAlert_Btn__cancel: {
    backgroundColor: g.revBg,
    marginRight: 10,
  },
  RootAlert_BtnTxt: {
    textAlign: `center`,
    color: g.revColor,
  },
});

const ErrorDetail = observer(props => {
  const $ = useStore(() => ({
    observable: {
      displayingDetail: false,
    },
  }));
  if (!props.err?.message) {
    return null;
  }
  if (!$.displayingDetail)
    return (
      <TouchableOpacity
        style={s.RootAlert_Err}
        onPress={() => $.set(`displayingDetail`, v => !v)}
      >
        <Text small style={s.RootAlert_ErrTxt__title}>
          Show error detail
        </Text>
      </TouchableOpacity>
    );
  return <Text small>{props.err.message}</Text>;
});

const Alert = ({ prompt, error, loading }) => {
  const [opacity] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: Platform.OS !== `web`,
    }).start();
  }, [opacity]);

  const [translateY] = useState(
    new Animated.Value(Dimensions.get(`screen`).height),
  );
  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 150,
      useNativeDriver: Platform.OS !== `web`,
    }).start();
  }, [translateY]);

  const p = {};
  if (prompt) {
    const { title, message, onConfirm, onDismiss, ...rest } = prompt;
    Object.assign(p, {
      title,
      message:
        typeof message === `string` ? (
          <Text style={s.RootAlert_Message}>{message}</Text>
        ) : (
          <View style={s.RootAlert_Message}>{message}</View>
        ),
      dismissText: `CANCEL`,
      confirmText: `REMOVE`,
      onConfirm: flow([g.dismissAlert, onConfirm].filter(f => f)),
      onDismiss: flow([g.dismissAlert, onDismiss].filter(f => f)),
      ...rest,
    });
  } else if (error) {
    const { message, err, unexpectedErr, ...rest } = error;
    Object.assign(p, {
      title: `Error`,
      message: (
        <React.Fragment>
          <Text style={s.RootAlert_Message}>
            {unexpectedErr
              ? `An unexpected error occurred`
              : `Failed to ${message}`}
          </Text>
          <ErrorDetail err={unexpectedErr || err} />
        </React.Fragment>
      ),
      confirmText: `OK`,
      onConfirm: g.dismissAlert,
      onDismiss: g.dismissAlert,
      ...rest,
    });
  } else if (loading) {
    // TODO
    return null;
  } else {
    return null;
  }
  return (
    <View style={[StyleSheet.absoluteFill, s.RootAlert]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          s.RootAlert_Backdrop,
          {
            opacity: opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={p.onDismiss}
        />
      </Animated.View>
      <Animated.View
        style={[
          s.RootAlert_Modal,
          {
            transform: [
              { translateY },
              // { scale: opacity },
            ],
          },
        ]}
      >
        <Text subTitle>{p.title}</Text>
        {p.message}
        <View style={s.RootAlert_Btns}>
          {p.dismissText && (
            <TouchableOpacity
              style={[s.RootAlert_Btn, s.RootAlert_Btn__cancel]}
              onPress={p.onDismiss}
            >
              <Text small style={s.RootAlert_BtnTxt}>
                {p.dismissText}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.RootAlert_Btn} onPress={p.onConfirm}>
            <Text small style={s.RootAlert_BtnTxt}>
              {p.confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const RootAlert = observer(() => {
  if (!g.alertsCount) {
    return null;
  }
  return <Alert {...g.alerts[0]} />;
});

export default RootAlert;
