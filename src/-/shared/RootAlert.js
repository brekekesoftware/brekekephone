import flow from 'lodash/flow'
import { observer } from 'mobx-react'
import React from 'react'

import g from '../global'
import intl from '../intl/intl'
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../Rn'
import { useAnimationOnDidMount } from '../utils/animation'

const css = StyleSheet.create({
  RootAlert: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  RootAlert_Backdrop: {
    backgroundColor: g.layerBg,
  },
  RootAlert_Modal: {
    width: '90%',
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
    alignSelf: 'flex-start',
  },
  RootAlert_ErrTxt: {
    color: g.colors.danger,
    fontWeight: g.fontWeight,
  },
  RootAlert_ErrTxt__title: {
    fontWeight: 'bold',
  },
  RootAlert_Btns: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    top: 5,
    left: 5,
    marginTop: 15,
  },
  RootAlert_Btn: {
    borderRadius: g.borderRadius,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: g.colors.primary,
    width: 100,
  },
  RootAlert_Btn__cancel: {
    backgroundColor: g.revBg,
    marginRight: 10,
  },
  RootAlert_BtnTxt: {
    textAlign: 'center',
    color: g.revColor,
  },
})

const Alert = ({ error, prompt, ...props }) => {
  const a = useAnimationOnDidMount({
    opacity: [0, 1],
    translateY: [Dimensions.get('screen').height, 0],
  })
  if (prompt) {
    const { message, onConfirm, onDismiss, title, ...rest } = prompt
    Object.assign(props, {
      title,
      message:
        typeof message === 'string' ? (
          <Text style={css.RootAlert_Message}>{message}</Text>
        ) : (
          <View style={css.RootAlert_Message}>{message}</View>
        ),
      dismissText: intl`CANCEL`,
      confirmText: intl`REMOVE`,
      onConfirm: flow([g.dismissAlert, onConfirm].filter(f => f)),
      onDismiss: flow([g.dismissAlert, onDismiss].filter(f => f)),
      ...rest,
    })
  } else if (error) {
    const { err, message, unexpectedErr, ...rest } = error
    const errMessage = unexpectedErr?.message || err?.message || err
    Object.assign(props, {
      title: intl`Error`,
      message: (
        <React.Fragment>
          <Text style={css.RootAlert_Message}>
            {unexpectedErr ? intl`An unexpected error occurred` : message}
          </Text>
          {!!errMessage && <Text small>{errMessage}</Text>}
        </React.Fragment>
      ),
      confirmText: intl`OK`,
      onConfirm: g.dismissAlert,
      onDismiss: g.dismissAlert,
      ...rest,
    })
  } else {
    return null
  }
  return (
    <View style={[StyleSheet.absoluteFill, css.RootAlert]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          css.RootAlert_Backdrop,
          { opacity: a.opacity },
        ]}
      >
        <TouchableOpacity
          onPress={props.onDismiss}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          css.RootAlert_Modal,
          {
            transform: [{ translateY: a.translateY }],
          },
        ]}
      >
        <Text subTitle>{props.title}</Text>
        {props.message}
        <View style={css.RootAlert_Btns}>
          {props.dismissText && (
            <TouchableOpacity
              onPress={props.onDismiss}
              style={[css.RootAlert_Btn, css.RootAlert_Btn__cancel]}
            >
              <Text small style={css.RootAlert_BtnTxt}>
                {props.dismissText}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={props.onConfirm} style={css.RootAlert_Btn}>
            <Text small style={css.RootAlert_BtnTxt}>
              {props.confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

const RootAlert = observer(() => {
  if (!g.alertsCount || !g.alerts[0]) {
    return null
  }
  return <Alert {...g.alerts[0]} />
})

export default RootAlert
