import { observer } from 'mobx-react'
import type { ReactElementLike } from 'prop-types'
import type { FC } from 'react'
import { useRef } from 'react'
import { ActivityIndicator, Keyboard } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { tw } from '@/rn/core/tw/tw'
import { flow, omit } from '@/shared/lodash'
import {
  mdiCardsDiamond,
  mdiClose,
  mdiPlus,
  mdiUnfoldMoreHorizontal,
} from '#/assets/icons'
import {
  RnIcon,
  RnSwitch,
  RnText,
  RnTextInput,
  RnTouchableOpacity,
} from '#/components/rn'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import { intl } from '#/stores/intl'
import { RnPicker } from '#/stores/rn-picker'
import { useStore } from '#/utils/use-store'

export type Park = {
  number: string
  name?: string
}
// fieldLabelClassName per platform:
// - ios: paddingTop 13px (pt-3.25), paddingBottom 0, paddingLeft 7px (pl-1.75)
// - android: paddingTop 3px (pt-0.75) + top 6px (top-1.5)
// - web: absolute, top/left/right: 0 (fix form auto fill style on web)
const fieldLabelClassName = tw`android:pt-0.75 android:top-1.5 web:pt-3.25 web:absolute web:top-0 web:left-0 web:right-0 ios:pt-3.25 pb-0 pl-1.75`
// fieldParkTextInputClassName: pl-1.75 (7px), pr-2.5 (10px), pb-0.75 (3px)
const fieldParkTextInputClassName = tw`android:pt-0 android:pb-0 android:leading-5 web:pt-7 web:w-full ios:pt-0.25 flex-1 overflow-hidden pr-2.5 pb-0.75 pl-1.75`
// fieldTextInputClassName: pl-1.75 (7px), pr-10 (40px), pb-0.75 (3px)
const fieldTextInputClassName = tw`android:pt-0 android:pb-0 android:leading-5 web:pt-7 ios:pt-0.25 w-full overflow-hidden pr-10 pb-0.75 pl-1.75 font-bold`

const noop = () => {}

export const Field: FC<
  Partial<{
    isGroup: boolean
    hasMargin: boolean
    label: string
    onCreateBtnPress(): void
    onValueChange: Function
    createBtnClassName: ClassName
    createBtnIcon: string
    createBtnIconClassName: ClassName
    removeBtnClassName: ClassName
    removeBtnIcon: string
    removeBtnIconClassName: ClassName
    onRemoveBtnPress(): void
    type: 'Switch' | 'RnPicker' | 'PARK'
    valueRender: Function
    value: string | boolean | Park
    textInputClassName?: ClassName
    options: {
      key: string
      label: string
    }[]
    icon: string
    onBlur(): void
    onFocus(): void
    onSubmitEditing(): void
    disabled: boolean
    inputElement: ReactElementLike | null
    onTouchPress(): void
    transparent: boolean
    secureTextEntry: boolean
    iconRender: Function
    error: string
    loading: boolean
    horizontalInput: string[]
    maxLength?: number
    onRnPickerConfirm(value: string): void
    onRnPickerDismiss(): void
    confirmRnPickerLabel: string
  }>
> = observer(({ ...props }) => {
  // handle enable/disable input Park
  const disablePark = props.type === 'PARK' && props.disabled

  const $0 = useStore(() => ({
    observable: {
      isFocusing: false,
      isParkNameFocusing: false,
      park: {
        number: '',
        name: '',
      },
    },
  }))
  const $ = $0 as typeof $0 & {
    isFocusing: boolean
    isParkNameFocusing: boolean
    park: Park
  }
  const inputRef = useRef<HTMLInputElement>(null)
  const inputRefName = useRef<HTMLInputElement>(null)
  const isGroup = props.isGroup
  // https://react.dev/warnings/invalid-hook-call-warning
  if (isGroup) {
    return (
      <View
        className={[
          'border-border bg-border mt-3.75 items-stretch border-b p-3.75',
          'android:pb-0.5',
          props.hasMargin && 'mt-7.5',
        ]}
      >
        <RnText small className='android:-top-1.5'>
          {props.label}
        </RnText>
      </View>
    )
  }

  if (!inputRef.current && $.isFocusing) {
    $.set('isFocusing', false)
  }
  if (!inputRefName.current && $.isParkNameFocusing) {
    $.set('isParkNameFocusing', false)
  }

  if (props.onCreateBtnPress) {
    Object.assign(props, {
      iconRender: () => (
        <RnTouchableOpacity
          onPress={props.onCreateBtnPress}
          className={[
            'bg-primary-100 absolute top-2.75 right-1.25 h-7.5 w-10 rounded-[3px]',
            props.createBtnClassName,
          ]}
          disabled={props.disabled}
        >
          <RnIcon
            color={v.colors.primary}
            path={props.createBtnIcon || mdiPlus}
            size={18}
            className={props.createBtnIconClassName}
          />
        </RnTouchableOpacity>
      ),
    })
  }
  if (props.onRemoveBtnPress) {
    Object.assign(props, {
      iconRender: () => (
        <RnTouchableOpacity
          onPress={props.onRemoveBtnPress}
          className={[
            'bg-error-100 absolute top-2.75 right-1.25 h-7.5 w-10 rounded-[3px]',
            props.removeBtnClassName,
          ]}
        >
          <RnIcon
            color={v.colors.danger}
            path={props.removeBtnIcon || mdiClose}
            size={15}
            className={props.removeBtnIconClassName}
          />
        </RnTouchableOpacity>
      ),
    })
  }
  const renderPark = () => {
    const value = props.value as Park
    const onChangeName = (name: string) => {
      const newPark = { ...$.park, name }
      $.set('park', newPark)
      props.onValueChange?.(newPark)
    }
    const onChangeNumber = (number: string) => {
      number = number.replace(/[^\x00-\x7F]/g, '')
      const newPark = { ...$.park, number }
      $.set('park', newPark)
      props.onValueChange?.(newPark)
    }
    return (
      <View className='mr-10 flex-row items-center'>
        <RnTextInput
          ref={inputRef}
          {...omit(props, [
            'type',
            'label',
            'valueRender',
            'icon',
            'iconRender',
            'onValueChange',
            'onCreateBtnPress',
            'createBtnIcon',
            'onRemoveBtnPress',
            'removeBtnIcon',
            'disabled',
            'error',
          ])}
          placeholder={intl`park number`}
          placeholderTextColor='grey'
          onBlur={() => {
            if (isWeb) {
              $.set('isFocusing', false)
            }
          }}
          onChangeText={txt => onChangeNumber(txt)}
          onFocus={() => {
            if (!isWeb) {
              $.set('isParkNameFocusing', false)
            }
            $.set('isFocusing', true)
          }}
          className={fieldParkTextInputClassName}
          value={value.number as string}
        />
        <RnTextInput
          ref={inputRefName}
          {...omit(props, [
            'type',
            'label',
            'valueRender',
            'icon',
            'iconRender',
            'onValueChange',
            'onCreateBtnPress',
            'createBtnIcon',
            'onRemoveBtnPress',
            'removeBtnIcon',
            'disabled',
            'error',
          ])}
          placeholder={intl`label`}
          placeholderTextColor='grey'
          onBlur={() => {
            if (isWeb) {
              $.set('isParkNameFocusing', false)
            }
          }}
          onChangeText={txt => onChangeName(txt)}
          onFocus={() => {
            if (!isWeb) {
              $.set('isFocusing', false)
            }
            $.set('isParkNameFocusing', true)
          }}
          className={fieldParkTextInputClassName}
          value={value.name as string}
        />
      </View>
    )
  }
  if (props.onValueChange) {
    if (props.type === 'Switch') {
      Object.assign(props, {
        valueRender:
          props.valueRender ||
          ((e: boolean) => (e ? intl`Enabled` : intl`Disabled`)),
        iconRender: (e: boolean) => (
          <RnSwitch enabled={e} className='absolute top-5.5 right-2.75' />
        ),
        onTouchPress: () => {
          props.onValueChange?.(!props.value)
          Keyboard.dismiss()
        },
      })
    } else if (props.type === 'RnPicker') {
      Object.assign(props, {
        valueRender: (k: string) =>
          props.options?.find(o => o.key === k)?.label || k,
        onTouchPress: () => {
          RnPicker.open({
            options: props.options || [],
            selectedKey: props.value as string,
            onSelect: props.onValueChange as Function,
            confirmLabel: props.confirmRnPickerLabel,
            onConfirm: props.onRnPickerConfirm,
            onDismiss: props.onRnPickerDismiss,
          })
          Keyboard.dismiss()
        },
        icon: props.icon || mdiUnfoldMoreHorizontal,
      })
    } else if (props.type === 'PARK') {
      Object.assign(props, {
        inputElement: renderPark(),
        onTouchPress: () => {
          if (!$.isFocusing && !$.isParkNameFocusing) {
            inputRef.current?.focus()
          }
        },
      })
    } else {
      Object.assign(props, {
        inputElement: (
          <RnTextInput
            ref={inputRef}
            {...omit(props, [
              'type',
              'label',
              'valueRender',
              'icon',
              'iconRender',
              'onValueChange',
              'onCreateBtnPress',
              'createBtnIcon',
              'onRemoveBtnPress',
              'removeBtnIcon',
              'disabled',
              'error',
            ])}
            onBlur={flow([
              () => $.set('isFocusing', false),
              props.onBlur || noop,
            ])}
            onChangeText={txt => props.onValueChange?.(txt)}
            onFocus={flow([
              () => $.set('isFocusing', true),
              props.onFocus || noop,
            ])}
            onSubmitEditing={flow([
              props.onCreateBtnPress || noop,
              props.onSubmitEditing || noop,
            ])}
            className={fieldTextInputClassName}
            value={props.value as string}
          />
        ),
        onTouchPress: () => inputRef.current?.focus(),
      })
    }
  }
  if (props.disabled) {
    props.inputElement = null
    props.onTouchPress = undefined
  }
  const Container = props.onTouchPress ? RnTouchableOpacity : View
  const label = (
    <View className={['pointer-events-none', fieldLabelClassName]}>
      <RnText small normal className='text-foreground-muted'>
        {props.label}
      </RnText>
    </View>
  )

  return (
    <>
      <Container
        accessible={!props.inputElement}
        onPress={props.onTouchPress}
        className={[
          'border-border mx-3.75 items-stretch border-b',
          'android:pb-0.5',
          ($.isFocusing || $.isParkNameFocusing) && 'bg-primary-100',
          props.disabled && 'bg-muted',
          props.transparent && 'mx-0 border-transparent',
        ]}
      >
        {/* Fix form auto fill style on web */}
        {!isWeb && label}
        <View
          className={
            !$.isFocusing && !$.isParkNameFocusing
              ? 'pointer-events-none'
              : undefined
          }
        >
          {props.inputElement || (
            <RnTextInput
              editable={!disablePark}
              disabled
              maxLength={props?.maxLength || 100000}
              secureTextEntry={!!(props.secureTextEntry && props.value)}
              className={[fieldTextInputClassName, props.textInputClassName]}
              value={
                props.valueRender?.(props.value) || props.value || '\u200a'
              }
            />
          )}
          {!$.isFocusing && disablePark && (
            <View className='absolute inset-0' />
          )}
        </View>
        {/* Fix form auto fill style on web */}
        {isWeb && label}
        {props.iconRender?.(props.value) ||
          (props.icon && (
            <RnIcon
              path={props.icon}
              className='text-foreground pointer-events-none absolute top-3.75 right-3.75'
            />
          ))}
        {props.loading && (
          <View className='absolute inset-0 flex items-center justify-center bg-black opacity-30'>
            <ActivityIndicator size='small' color='white' />
          </View>
        )}
      </Container>
      {props.error && (
        <RnTouchableOpacity
          onPress={() => inputRef.current?.focus()}
          className='items-center justify-center'
        >
          <View className='bg-error mx-3.75 my-0.5 self-start rounded-[3px] px-2.5 py-0.5'>
            <RnIcon
              color={v.colors.danger}
              path={mdiCardsDiamond}
              className='absolute -top-2 left-0.5'
            />
            <RnText small white>
              {props.error}
            </RnText>
          </View>
        </RnTouchableOpacity>
      )}
    </>
  )
})
