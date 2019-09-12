import flow from 'lodash/flow';
import { observer } from 'mobx-react';
import React from 'react';
import { StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

import g from '../global';
import v from '../variables';

const s = StyleSheet.create({
  RootAlerts: {
    position: 'relative',
    width: 300,
    shadowColor: v.fn.transparentize(0.8, 'black'),
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
    borderRadius: v.borderRadius,
    padding: 10,
    paddingBottom: 40,
  },
  RootAlerts_Title: {
    alignSelf: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  RootAlerts_Message: {
    alignSelf: 'flex-start',
    padding: 0,
    marginBottom: 30,
  },
  RootAlerts_Btn: {
    position: 'absolute',
    top: -10,
    right: -145,
    borderRadius: v.borderRadius,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: v.brekekeGreenBtn,
    width: 100,
  },
  RootAlerts_Btn__cancel: {
    right: -35,
    backgroundColor: v.brekekeShade8,
  },
  RootAlerts_BtnTxt: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: v.fontSizeSmall,
  },
});

const RootAlerts = observer(() => {
  if (!g.pendingAlerts.length) {
    return null;
  }
  const { prompt, error, loading } = g.pendingAlerts[0];
  let aaProps = null;
  if (prompt) {
    const { title, message, onConfirm, onDismiss } = prompt;
    const onConfirmPressed = flow(
      ...[g.dismissAlert, ...(onConfirm ? [onConfirm] : [])],
    );
    const onCancelPressed = flow(
      ...[g.dismissAlert, ...(onDismiss ? [onDismiss] : [])],
    );
    aaProps = {
      title,
      message,
      showCancelButton: true,
      showConfirmButton: true,
      cancelText: 'CANCEL',
      confirmText: 'REMOVE',
      onCancelPressed,
      onConfirmPressed,
      onDismiss: onCancelPressed,
    };
  } else if (error) {
    const { message: msg, err, unexpectedErr } = error;
    // TODO render err/unexpectedErr
    void err;
    const message = unexpectedErr
      ? 'An unexpected error occurred'
      : `Failed to ${msg}`;
    aaProps = {
      title: 'Error',
      message,
      showCancelButton: false,
      showConfirmButton: true,
      confirmText: 'OK',
      onConfirmPressed: g.dismissAlert,
      onDismiss: g.dismissAlert,
    };
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
      cancelButtonStyle={[s.RootAlerts_Btn, s.RootAlerts_Btn__cancel]}
      confirmButtonColor={v.brekekeGreenBtn}
      confirmButtonStyle={s.RootAlerts_Btn}
      cancelButtonTextStyle={s.RootAlerts_BtnTxt}
      confirmButtonTextStyle={s.RootAlerts_BtnTxt}
      {...aaProps}
    />
  );
});

export default RootAlerts;
