import { observer } from 'mobx-react'
import type { ReactElementLike } from 'prop-types'
import type { FC } from 'react'
import { useRef } from 'react'
import { ActivityIndicator, Keyboard } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
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
import { isAndroid, isIos, isWeb } from '#/config'
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
const fieldLabelClassName = isAndroid
  ? 'pb-0 pl-1.75 pt-0.75 top-1.5'
  : isWeb
    ? 'pb-0 pl-1.75 pt-3.25 absolute top-0 left-0 right-0'
    : 'pb-0 pl-1.75 pt-3.25'
// fieldParkTextInputClassName: pl-1.75 (7px), pr-2.5 (10px), pb-0.75 (3px)
// Platform.select branches: android lineHeight 20 ≡ leading-5 (= v.lineHeight)
const fieldParkTextInputClassName = [
  'flex-1 pb-0.75 pl-1.75 pr-2.5 overflow-hidden',
  isAndroid && 'pt-0 pb-0 leading-5',
  isWeb && 'pt-7 w-full',
  isIos && 'pt-0.25',
]
// fieldTextInputClassName: pl-1.75 (7px), pr-10 (40px), pb-0.75 (3px)
const fieldTextInputClassName = [
  'w-full pb-0.75 pl-1.75 pr-10 font-bold overflow-hidden',
  isAndroid && 'pt-0 pb-0 leading-5',
  isWeb && 'pt-7',
  isIos && 'pt-0.25',
]

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
          'border-b border-border items-stretch mt-3.75 bg-border p-3.75',
          isAndroid && 'pb-0.5',
          props.hasMargin && 'mt-7.5',
        ]}
      >
        <RnText
          small
          className={isAndroid ? '-top-1.5' : undefined}
        >
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
            'absolute top-2.75 right-1.25 w-10 h-7.5 rounded-[3px] bg-primary-100',
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
            'absolute top-2.75 right-1.25 w-10 h-7.5 rounded-[3px] bg-error-100',
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
      <View className='flex-row items-center mr-10'>
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
          'border-b border-border items-stretch mx-3.75',
          isAndroid && 'pb-0.5',
          ($.isFocusing || $.isParkNameFocusing) && 'bg-primary-100',
          props.disabled && 'bg-muted',
          props.transparent && 'border-transparent mx-0',
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
              className='absolute top-3.75 right-3.75 pointer-events-none'
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
          <View className='self-start my-0.5 mx-3.75 py-0.5 px-2.5 bg-error rounded-[3px]'>
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
