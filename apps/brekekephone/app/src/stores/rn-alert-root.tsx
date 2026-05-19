import { observer } from 'mobx-react'
import type { ReactElement } from 'react'
import { Dimensions } from 'react-native'

import { AnimatedView } from '@/rn/core/components/animated'
import { View } from '@/rn/core/components/view'
import { flow } from '@/shared/lodash'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
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
        className='absolute inset-0 bg-modal-overlay'
        style={{ opacity: a.opacity }}
      >
        <RnTouchableOpacity
          onPress={props.onDismiss}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedView
        className='w-[90%] max-w-95 rounded-[3px] p-3.75 bg-background'
        style={{
          ...v.boxShadow,
          transform: [{ translateY: a.translateY }],
        }}
      >
        {!!props.title && <RnText subTitle>{props.title}</RnText>}
        {props.message}
        <View className='mt-3.75 flex-row self-end top-1.25 left-1.25'>
          {props.dismissText && (
            <RnTouchableOpacity
              onPress={props.onDismiss}
              className='mr-2.5 w-25 rounded-[3px] px-3.75 py-2.5 bg-reverse'
            >
              <RnText small white className='text-center'>
                {props.dismissText}
              </RnText>
            </RnTouchableOpacity>
          )}
          <RnTouchableOpacity
            onPress={props.onConfirm}
            className='w-25 rounded-[3px] px-3.75 py-2.5 bg-primary'
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
