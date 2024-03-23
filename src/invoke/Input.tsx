import { forwardRef, useImperativeHandle, useState } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { ItemType } from 'react-native-dropdown-picker'

import {
  mdiArrowDownDropCircleOutline,
  mdiArrowUpDropCircleOutline,
  mdiCheck,
} from '../assets/icons'
import { RnIcon } from '../components/RnIcon'
import { Dropdown } from './Dropdown'

type InputProps = {
  title?: string
  k: string
  type?: 'input' | 'dropdown'
  items: ItemType<any>[]
  isRequired?: boolean
  errMessage?: string
} & TextInputProps

export const Input = forwardRef(
  (
    {
      title,
      k,
      type = 'input',
      items = [],
      style,
      value: vInput = '',
      isRequired = true,
      errMessage = '',
      ...rest
    }: InputProps,
    ref,
  ) => {
    const [value, setValue] = useState(vInput)
    const [error, setError] = useState('')

    useImperativeHandle(ref, () => ({
      getValue: () => {
        const errD = isRequired && !value ? errMessage : ''
        if (errD) {
          setError(errD)
        }
        return {
          key: k,
          value,
          err: errD,
        }
      },
      reset: () => {
        setValue('')
      },
      setError: (err: string) => {
        setError(err)
      },
    }))

    const ArrowUpIcon = () => (
      <RnIcon path={mdiArrowUpDropCircleOutline} color='white' size={20} />
    )
    const ArrowDownIcon = () => (
      <RnIcon path={mdiArrowDownDropCircleOutline} color='white' size={20} />
    )
    const TickIcon = () => <RnIcon path={mdiCheck} color='white' />

    return (
      <View style={styles.container}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        {type === 'input' ? (
          <TextInput
            {...rest}
            value={value}
            style={[styles.input, style]}
            onChangeText={t => setValue(t)}
            onFocus={() => setError('')}
          />
        ) : (
          <Dropdown
            value={value}
            setValue={(v: any) => setValue(v)}
            items={items}
            style={{
              height: 40,
              minHeight: 40,
              backgroundColor: 'transparent',
              borderColor: '#b6b6b6',
              position: 'relative',
            }}
            textStyle={{ color: 'white' }}
            dropDownContainerStyle={{
              backgroundColor: 'rgb(0,126,182)',
              borderColor: '#b6b6b6',
              zIndex: 99999,
            }}
            placeholder=''
            ArrowUpIconComponent={ArrowUpIcon}
            listItemContainerStyle={{ height: 30 }}
            ArrowDownIconComponent={ArrowDownIcon}
            TickIconComponent={TickIcon}
          />
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 6,
    paddingVertical: 8,
  },
  input: {
    borderColor: '#b6b6b6',
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    paddingLeft: 10,
    color: 'white',
  },
  title: {
    color: 'white',
  },
  error: {
    color: 'red',
    fontSize: 12,
    fontStyle: 'italic',
  },
})
