import { observer } from 'mobx-react'
import type { ReactElement } from 'react'
import { useWindowDimensions } from 'react-native'

import { View } from '@/rn/core/components/view'
import { flow } from '@/shared/lodash'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'
import { intl } from '#/stores/intl'
import type { ErrorRnAlert2, PromptRnAlert } from '#/stores/rn-alert'
import { RnAlert } from '#/stores/rn-alert'
import { useAnimationOnDidMount } from '#/utils/animation'

const RnAlertR = ({
  error,
  prompt,
}: {
  error?: ErrorRnAlert2
  prompt?: PromptRnAlert
}) => {
  const { height } = useWindowDimensions()
  const a = useAnimationOnDidMount({
    opacity: [0, 1],
    translateY: [height, 0],
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
          <RnText className='mt-3.75'>{message}</RnText>
        ) : (
          <View className='mt-3.75'>{message}</View>
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
    const errMessage = `${unexpectedErr?.message || err?.message || err}`
    props = {
      title: intl`Error`,
      message: (
        <>
          <RnText className='mt-3.75'>
            {unexpectedErr ? intl`An unexpected error occurred` : message}
          </RnText>
          {!!errMessage && <RnText small>{errMessage}</RnText>}
        </>
      ),
      confirmText: 'OK',
      onConfirm: RnAlert.dismiss,
      onDismiss: RnAlert.dismiss,
      ...rest,
    }
  } else {
    return null
  }
  return (
    <View className='absolute inset-0 flex-row items-center justify-center'>
      <AnimatedView
        className='bg-modal-overlay absolute inset-0'
        style={{ opacity: a.opacity }}
      >
        <RnTouchableOpacity
          onPress={props.onDismiss}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedView
        className='bg-background rounded-card w-[90%] max-w-95 p-3.75 shadow-sm'
        style={{ transform: [{ translateY: a.translateY }] }}
      >
        {!!props.title && <RnText subTitle>{props.title}</RnText>}
        {props.message}
        <View className='top-1.25 left-1.25 mt-3.75 flex-row self-end'>
          {props.dismissText && (
            <RnTouchableOpacity
              onPress={props.onDismiss}
              className='bg-foreground rounded-button mr-2.5 w-25 px-3.75 py-2.5'
            >
              <RnText small className='text-background text-center'>
                {props.dismissText}
              </RnText>
            </RnTouchableOpacity>
          )}
          <RnTouchableOpacity
            onPress={props.onConfirm}
            className='bg-primary rounded-button w-25 px-3.75 py-2.5'
          >
            <RnText small white className='text-center'>
              {props.confirmText}
            </RnText>
          </RnTouchableOpacity>
        </View>
      </AnimatedView>
    </View>
  )
}

export const RnAlertRoot = observer(() => {
  const a0 = RnAlert.alerts.find(a => a)
  if (!RnAlert.alertsCount || !a0) {
    return null
  }
  return <RnAlertR {...a0} />
})
