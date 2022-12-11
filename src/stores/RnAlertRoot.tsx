import flow from 'lodash/flow'
import { observer } from 'mobx-react'
import { ReactElement } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import { RnText, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'
import { useAnimationOnDidMount } from '../utils/animation'
import { intl } from './intl'
import { ErrorRnAlert2, PromptRnAlert, RnAlert } from './RnAlert'

const css = StyleSheet.create({
  RootRnAlert: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  RootRnAlert_Backdrop: {
    backgroundColor: v.layerBg,
  },
  RootRnAlert_Modal: {
    width: '90%',
    maxWidth: v.maxModalWidth,
    borderRadius: v.borderRadius,
    padding: 15,
    backgroundColor: v.bg,
    ...v.boxShadow,
  },
  RootRnAlert_Message: {
    marginTop: 15,
  },
  RootRnAlert_Err: {
    alignSelf: 'flex-start',
  },
  RootRnAlert_ErrTxt: {
    color: v.colors.danger,
    fontWeight: v.fontWeight,
  },
  RootRnAlert_ErrTxt__title: {
    fontWeight: 'bold',
  },
  RootRnAlert_Btns: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    top: 5,
    left: 5,
    marginTop: 15,
  },
  RootRnAlert_Btn: {
    borderRadius: v.borderRadius,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: v.colors.primary,
    width: 100,
  },
  RootRnAlert_Btn__cancel: {
    backgroundColor: v.revBg,
    marginRight: 10,
  },
  RootRnAlert_BtnTxt: {
    textAlign: 'center',
    color: v.revColor,
  },
})

const RnAlertR = ({
  error,
  prompt,
}: {
  error?: ErrorRnAlert2
  prompt?: PromptRnAlert
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
    onConfirm(): void
    onDismiss(): void
  }
  if (prompt) {
    const { message, onConfirm, onDismiss, title, ...rest } = prompt
    props = {
      title,
      message:
        typeof message === 'string' ? (
          <RnText style={css.RootRnAlert_Message}>{message}</RnText>
        ) : (
          <View style={css.RootRnAlert_Message}>{message}</View>
        ),
      dismissText: intl`CANCEL`,
      confirmText: intl`REMOVE`,
      onConfirm: flow(
        [RnAlert.dismiss, onConfirm as any].filter((f: Function) => f),
      ),
      onDismiss: flow(
        [RnAlert.dismiss, onDismiss as any].filter((f: Function) => f),
      ),
      ...rest,
    }
  } else if (error) {
    const { err, message, unexpectedErr, ...rest } = error
    const errMessage = unexpectedErr?.message || err?.message || err
    props = {
      title: intl`Error`,
      message: (
        <>
          <RnText style={css.RootRnAlert_Message}>
            {unexpectedErr ? intl`An unexpected error occurred` : message}
          </RnText>
          {!!errMessage && <RnText small>{errMessage}</RnText>}
        </>
      ),
      confirmText: intl`OK`,
      onConfirm: RnAlert.dismiss,
      onDismiss: RnAlert.dismiss,
      ...rest,
    }
  } else {
    return null
  }
  return (
    <View style={[StyleSheet.absoluteFill, css.RootRnAlert]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          css.RootRnAlert_Backdrop,
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
          css.RootRnAlert_Modal,
          {
            transform: [{ translateY: a.translateY }],
          },
        ]}
      >
        <RnText subTitle>{props.title}</RnText>
        {props.message}
        <View style={css.RootRnAlert_Btns}>
          {props.dismissText && (
            <RnTouchableOpacity
              onPress={props.onDismiss}
              style={[css.RootRnAlert_Btn, css.RootRnAlert_Btn__cancel]}
            >
              <RnText small style={css.RootRnAlert_BtnTxt}>
                {props.dismissText}
              </RnText>
            </RnTouchableOpacity>
          )}
          <RnTouchableOpacity
            onPress={props.onConfirm}
            style={css.RootRnAlert_Btn}
          >
            <RnText small style={css.RootRnAlert_BtnTxt}>
              {props.confirmText}
            </RnText>
          </RnTouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

export const RnAlertRoot = observer(() => {
  if (!RnAlert.alertsCount || !RnAlert.alerts[0]) {
    return null
  }
  return <RnAlertR {...RnAlert.alerts[0]} />
})
