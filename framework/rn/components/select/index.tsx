'use client'

import { useCallback, useState } from 'react'

import { Drawer } from '@/rn/components/drawer'
import { Dropdown } from '@/rn/components/dropdown'
import type { InputCva } from '@/rn/components/input/input-cva'
import { inputCva } from '@/rn/components/input/input-cva'
import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { useWindowDimensions } from '@/rn/core/responsive/use-window-dimensions'
import type { ClassName } from '@/rn/core/tw/class-name'
import { cva } from '@/rn/core/tw/cva'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { Check } from '@/rn/svg-icons/check'
import { ChevronBottom } from '@/rn/svg-icons/chevron-bottom'
import type { MultipleProps, SingleProps } from '@/shared/ts-utils'

const selectCva = cva({
  classNames: {
    trigger: 'flex-row items-center',
    label: 'flex-1',
    placeholder: 'flex-1',
    titleBar: 'border-b border-gray-100 px-4 py-3 dark:border-gray-800',
    titleText: 'font-semibold text-gray-800 transition dark:text-white',
    item: 'flex-row items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800',
    itemActive: 'dark:bg-primary/10 bg-primary-50',
    itemLabel: 'text-sm text-gray-800 dark:text-white',
    itemLabelActive: 'font-medium text-primary',
    itemCheck: 'text-primary',
    doneBar: 'border-t border-gray-100 px-4 py-3 dark:border-gray-800',
    doneBtn: 'items-center rounded-lg bg-primary py-2',
    doneBtnLabel: 'text-sm font-semibold text-white',
  },
  attributes: {
    size: {
      sm: { trigger: 'gap-1' },
      md: { trigger: 'gap-1.5' },
      lg: { trigger: 'gap-2' },
    },
  },
})

export type SelectItem = { value: string; label: string }

type BaseProps = Omit<InputCva, 'active'> & {
  items: SelectItem[]
  placeholder?: string
  title?: string
  doneLabel?: string
  className?: ClassName
}

export type SelectProps = (SingleProps | MultipleProps) & BaseProps

export const Select = ({
  multiple,
  appearance = 'outlined',
  size = 'md',
  shape = 'rounded',
  disabled,
  items,
  placeholder = 'Select an option',
  title,
  doneLabel = 'Done',
  invalid,
  value,
  defaultValue,
  onChange,
  className,
}: SelectProps) => {
  const [open, setOpen] = useState(false)
  const [referenceEl, setReferenceEl] = useState<any>(null)
  const setRef = useCallback((el: any) => setReferenceEl(el), [])
  const [state, setState] = useControllableState<string | string[]>({
    value: value as any,
    defaultValue: defaultValue || (multiple ? [] : ''),
    onChange: onChange as any,
  })

  const dimensions = useWindowDimensions()
  const useDropdown = dimensions && dimensions.width >= 640

  const fieldCn = inputCva({
    appearance,
    size,
    shape,
    disabled,
    invalid,
    active: open,
  })
  const cn = selectCva({ size })

  const triggerLabel = (() => {
    if (!multiple) {
      return items.find(i => i.value === (state as string))?.label || ''
    }
    const arr = Array.isArray(state) ? state : []
    if (arr.length === 0) {
      return ''
    }
    const itemMap = new Map(items.map(i => [i.value, i]))
    return arr.map(v => itemMap.get(v)?.label || v).join(', ')
  })()

  const isSelected = (itemValue: string) => {
    if (!multiple) {
      return state === itemValue
    }
    return Array.isArray(state) && state.includes(itemValue)
  }

  const handleSelect = (item: SelectItem) => {
    if (!multiple) {
      setState(item.value)
      setOpen(false)
      return
    }
    setState(prev => {
      const arr = Array.isArray(prev) ? prev : []
      return arr.includes(item.value)
        ? arr.filter(v => v !== item.value)
        : [...arr, item.value]
    })
  }

  return (
    <>
      <Pressable
        ref={setRef}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={[fieldCn.container, cn.trigger, className]}
        renderToHardwareTextureAndroid={disabled}
        shouldRasterizeIOS={disabled}
      >
        <Span
          className={
            triggerLabel
              ? [fieldCn.label, cn.label]
              : [fieldCn.placeholder, cn.placeholder]
          }
        >
          {triggerLabel || placeholder}
        </Span>
        <ChevronBottom className={fieldCn.chevron} />
      </Pressable>

      {useDropdown ? (
        <Dropdown
          open={open}
          onClose={() => setOpen(false)}
          reference={referenceEl}
        >
          <Dropdown.ScrollView>
            {items.map(item => {
              const sel = isSelected(item.value)
              return (
                <Pressable
                  key={item.value}
                  onPress={() => handleSelect(item)}
                  className={[cn.item, sel && cn.itemActive]}
                >
                  <Span className={[cn.itemLabel, sel && cn.itemLabelActive]}>
                    {item.label}
                  </Span>
                  {sel && <Check className={cn.itemCheck} />}
                </Pressable>
              )
            })}
          </Dropdown.ScrollView>
          {multiple && (
            <View className={cn.doneBar}>
              <Pressable className={cn.doneBtn} onPress={() => setOpen(false)}>
                <Span className={cn.doneBtnLabel}>{doneLabel}</Span>
              </Pressable>
            </View>
          )}
        </Dropdown>
      ) : (
        <Drawer
          value={open}
          onChange={setOpen}
          contentContainerClassName='pb-8'
        >
          {title && (
            <View className={cn.titleBar}>
              <Span className={cn.titleText}>{title}</Span>
            </View>
          )}
          {items.map(item => {
            const sel = isSelected(item.value)
            return (
              <Pressable
                key={item.value}
                onPress={() => handleSelect(item)}
                className={[cn.item, sel && cn.itemActive]}
              >
                <Span className={[cn.itemLabel, sel && cn.itemLabelActive]}>
                  {item.label}
                </Span>
                {sel && <Check className={cn.itemCheck} />}
              </Pressable>
            )
          })}
          {multiple && (
            <View className={cn.doneBar}>
              <Pressable className={cn.doneBtn} onPress={() => setOpen(false)}>
                <Span className={cn.doneBtnLabel}>{doneLabel}</Span>
              </Pressable>
            </View>
          )}
        </Drawer>
      )}
    </>
  )
}
