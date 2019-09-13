import flow from 'lodash/flow';
import { observer } from 'mobx-react';
import React from 'react';
import AwesomeAlert from 'react-native-awesome-alerts';

import g from '../global';
import { StyleSheet } from '../native/Rn';
import v from '../variables';

const s = StyleSheet.create({
  RootAlerts: {
    width: 300,
    borderRadius: v.borderRadius,
    padding: 10,
    paddingBottom: 40,
    ...v.boxShadow,
  },
  RootAlerts_Title: {
    alignSelf: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 5,
    fontSize: v.fontSizeSubTitle,
    fontWeight: 'bold',
    color: v.color,
  },
  RootAlerts_Message: {
    alignSelf: 'flex-start',
    padding: 0,
    marginBottom: 30,
    fontSize: v.fontSize,
    color: v.color,
  },
  RootAlerts_Btn: {
    position: 'absolute',
    top: -10,
    left: 35,
    borderRadius: v.borderRadius,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: v.mainDarkBg,
    width: 100,
  },
  RootAlerts_Btn__cancel: {
    left: null,
    right: -35,
    backgroundColor: v.revBg,
  },
  RootAlerts_Btn__hidden: {
    display: 'none',
  },
  RootAlerts_BtnTxt: {
    fontSize: v.fontSizeSmall,
    fontWeight: 'bold',
    fontFamily: v.fontFamily,
    textAlign: 'center',
  },
});

const RootAlerts = observer(() => {
  if (!g.pendingAlerts.length) {
    return null;
  }
  const { prompt, error, loading } = g.pendingAlerts[0];
  let p = {
    showCancelButton: true,
    showConfirmButton: true,
  };
  if (prompt) {
    const { title, message, onConfirm, onDismiss, ...rest } = prompt;
    const onConfirmPressed = flow(
      ...[g.dismissAlert, ...(onConfirm ? [onConfirm] : [])],
    );
    const onCancelPressed = flow(
      ...[g.dismissAlert, ...(onDismiss ? [onDismiss] : [])],
    );
    Object.assign(p, {
      title,
      message,
      cancelText: 'CANCEL',
      confirmText: 'REMOVE',
      onCancelPressed,
      onConfirmPressed,
      onDismiss: onCancelPressed,
      ...rest,
    });
  } else if (error) {
    const { message: msg, err, unexpectedErr, ...rest } = error;
    // TODO render err/unexpectedErr
    void err;
    const message = unexpectedErr
      ? 'An unexpected error occurred'
      : `Failed to ${msg}`;
    Object.assign(p, {
      title: 'Error',
      message,
      confirmText: 'OK',
      onCancelPressed: g.dismissAlert,
      onConfirmPressed: g.dismissAlert,
      onDismiss: g.dismissAlert,
      ...rest,
    });
  } else if (loading) {
    // TODO
  } else {
    return null;
  }
  return (
    <AwesomeAlert
      show
      showProgress={false}
      closeOnTouchOutside
      closeOnHardwareBackPress
      contentContainerStyle={s.RootAlerts}
      titleStyle={s.RootAlerts_Title}
      messageStyle={s.RootAlerts_Message}
      cancelButtonStyle={[
        s.RootAlerts_Btn,
        s.RootAlerts_Btn__cancel,
        !p.cancelText && s.RootAlerts_Btn__hidden,
      ]}
      confirmButtonColor={v.mainDarkBg}
      confirmButtonStyle={s.RootAlerts_Btn}
      cancelButtonTextStyle={s.RootAlerts_BtnTxt}
      confirmButtonTextStyle={s.RootAlerts_BtnTxt}
      {...p}
    />
  );
});

export default RootAlerts;
