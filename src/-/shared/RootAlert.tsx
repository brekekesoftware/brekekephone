import flow from 'lodash/flow'
import { observer } from 'mobx-react'
import React, { ReactElement } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import g from '../global'
import Alert, { ErrorAlert2, PromptAlert } from '../global/Alert'
import intl from '../intl/intl'
import { RnText, RnTouchableOpacity } from '../Rn'
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

const AlertR = ({
  error,
  prompt,
}: {
  error?: ErrorAlert2
  prompt?: PromptAlert
}) => {
  const a = useAnimationOnDidMount({
    opacity: [0, 1],
    translateY: [Dimensions.get('screen').height, 0],
  })
  let props: {
    title: string | ReactElement
    message: string | ReactElement
    dismissText?: string | boolean
    confirmText?: string | boolean
    onConfirm: Function
    onDismiss: Function
  }
  if (prompt) {
    const { message, onConfirm, onDismiss, title, ...rest } = prompt
    props = {
      title,
      message:
        typeof message === 'string' ? (
          <RnText style={css.RootAlert_Message}>{message}</RnText>
        ) : (
          <View style={css.RootAlert_Message}>{message}</View>
        ),
      dismissText: intl`CANCEL`,
      confirmText: intl`REMOVE`,
      onConfirm: flow([Alert.dismiss, onConfirm as any].filter(f => f)),
      onDismiss: flow([Alert.dismiss, onDismiss as any].filter(f => f)),
      ...rest,
    }
  } else if (error) {
    const { err, message, unexpectedErr, ...rest } = error
    const errMessage = unexpectedErr?.message || err?.message || err
    props = {
      title: intl`Error`,
      message: (
        <React.Fragment>
          <RnText style={css.RootAlert_Message}>
            {unexpectedErr ? intl`An unexpected error occurred` : message}
          </RnText>
          {!!errMessage && <RnText small>{errMessage}</RnText>}
        </React.Fragment>
      ),
      confirmText: intl`OK`,
      onConfirm: Alert.dismiss,
      onDismiss: Alert.dismiss,
      ...rest,
    }
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
        <RnTouchableOpacity
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
        <RnText subTitle>{props.title}</RnText>
        {props.message}
        <View style={css.RootAlert_Btns}>
          {props.dismissText && (
            <RnTouchableOpacity
              onPress={props.onDismiss}
              style={[css.RootAlert_Btn, css.RootAlert_Btn__cancel]}
            >
              <RnText small style={css.RootAlert_BtnTxt}>
                {props.dismissText}
              </RnText>
            </RnTouchableOpacity>
          )}
          <RnTouchableOpacity
            onPress={props.onConfirm}
            style={css.RootAlert_Btn}
          >
            <RnText small style={css.RootAlert_BtnTxt}>
              {props.confirmText}
            </RnText>
          </RnTouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

const RootAlert = observer(() => {
  if (!Alert.alertsCount || !Alert.alerts[0]) {
    return null
  }
  return <AlertR {...Alert.alerts[0]} />
})

export default RootAlert
