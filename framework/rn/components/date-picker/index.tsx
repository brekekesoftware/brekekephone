'use client'

import { useCallback, useState } from 'react'

import { getCalendarGrid } from '@/rn/components/date-picker/get-calendar-grid'
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
import { ChevronBottom } from '@/rn/svg-icons/chevron-bottom'
import { ChevronLeft } from '@/rn/svg-icons/chevron-left'
import { ChevronRight } from '@/rn/svg-icons/chevron-right'
import type { ValueProps } from '@/shared/ts-utils'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear()

const formatDate = (date: Date) =>
  `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`

const datePickerCva = cva({
  classNames: {
    trigger: 'flex-row items-center',
    label: 'flex-1',
    placeholder: 'flex-1',
  },
  attributes: {
    size: {
      sm: { trigger: 'gap-1' },
      md: { trigger: 'gap-1.5' },
      lg: { trigger: 'gap-2' },
    },
  },
})

type CalendarProps = {
  value: Date | undefined
  onSelect: (date: Date) => void
}

const Calendar = ({ value, onSelect }: CalendarProps) => {
  const today = new Date()
  const initial = value || today
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const grid = getCalendarGrid(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    onSelect(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
  }

  return (
    <View className='pb-6'>
      <View className='flex-row items-center justify-between px-4 py-3'>
        <Pressable
          onPress={prevMonth}
          className='h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <ChevronLeft className='text-gray-600 dark:text-gray-400' />
        </Pressable>

        <Span className='font-semibold text-foreground transition'>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Span>

        <Pressable
          onPress={nextMonth}
          className='h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <ChevronRight className='text-gray-600 dark:text-gray-400' />
        </Pressable>
      </View>

      <View className='flex-row px-2 pb-1'>
        {DAY_LABELS.map(d => (
          <View key={d} className='flex-1 items-center'>
            <Span className='text-xs font-medium text-gray-400 dark:text-gray-500'>
              {d}
            </Span>
          </View>
        ))}
      </View>

      <View className='px-2'>
        {Array.from({ length: 6 }, (_, row) => (
          <View key={row} className='flex-row'>
            {grid.slice(row * 7, row * 7 + 7).map(({ date, current }) => {
              const selected = value ? isSameDay(date, value) : false
              const isToday = isSameDay(date, today)

              return (
                <Pressable
                  key={date.toISOString()}
                  onPress={() => onSelect(date)}
                  className='flex-1 items-center py-0.5'
                >
                  <View
                    className={[
                      'h-8 w-8 items-center justify-center rounded-full transition-colors',
                      selected
                        ? 'bg-primary'
                        : isToday
                          ? 'dark:bg-primary/20 bg-primary-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    ]}
                  >
                    <Span
                      className={[
                        'text-sm transition',
                        selected
                          ? 'font-semibold text-white'
                          : isToday
                            ? 'font-semibold text-primary'
                            : current
                              ? 'text-gray-800 dark:text-gray-100'
                              : 'text-gray-300 dark:text-gray-600',
                      ]}
                    >
                      {date.getDate()}
                    </Span>
                  </View>
                </Pressable>
              )
            })}
          </View>
        ))}
      </View>

      <View className='mt-3 items-center px-4'>
        <Pressable
          onPress={goToday}
          className='rounded-full border border-gray-200 px-4 py-1.5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
        >
          <Span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
            Today
          </Span>
        </Pressable>
      </View>
    </View>
  )
}

export type DatePickerProps = Omit<InputCva, 'active'> &
  ValueProps<Date> & {
    placeholder?: string
    className?: ClassName
  }

export const DatePicker = ({
  appearance = 'outlined',
  size = 'md',
  shape = 'rounded',
  disabled,
  invalid,
  placeholder = 'Select a date',
  value,
  defaultValue,
  onChange,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [referenceEl, setReferenceEl] = useState<any>(null)
  const setRef = useCallback((el: any) => setReferenceEl(el), [])
  const [selected, setSelected] = useControllableState<Date | undefined>({
    value,
    defaultValue,
    onChange: v => v && onChange?.(v),
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
  const cn = datePickerCva({ size })

  const handleSelect = (date: Date) => {
    setSelected(date)
    setOpen(false)
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
            selected
              ? [fieldCn.label, cn.label]
              : [fieldCn.placeholder, cn.placeholder]
          }
        >
          {selected ? formatDate(selected) : placeholder}
        </Span>
        <ChevronBottom className={fieldCn.chevron} />
      </Pressable>

      {useDropdown ? (
        <Dropdown
          open={open}
          onClose={() => setOpen(false)}
          reference={referenceEl}
        >
          <Calendar value={selected} onSelect={handleSelect} />
        </Dropdown>
      ) : (
        <Drawer value={open} onChange={setOpen}>
          <Calendar value={selected} onSelect={handleSelect} />
        </Drawer>
      )}
    </>
  )
}
