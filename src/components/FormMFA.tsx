import { upperCase } from 'lodash'
import type { JSX } from 'react'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { TextInputProps } from 'react-native'
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'

import type { FieldInputRef } from '#/components/FieldInput'
import { FieldInput } from '#/components/FieldInput'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { ToastMFA } from '#/components/ToastMFA'
import { v } from '#/components/variables'

const { height } = Dimensions.get('window')
const css = StyleSheet.create({
  Container: { flex: 1, maxHeight: 395, maxWidth: 400 },
  ContainerStyle: {
    paddingTop: 20,
  },
  Label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  FieldContainer: {
    marginBottom: 16,
  },
  Button: {
    height: height * 0.065,
    width: '100%',
    backgroundColor: v.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  Button_Disable: {
    opacity: 0.5,
  },
  ErrorBorder: {
    borderColor: v.colors.danger,
    borderWidth: 1.2,
    borderRadius: 5,
  },
})

export interface FormFields extends Partial<TextInputProps> {
  id: string
  label?: string
  placeholder: string
}

type ToastMFAType = {
  body: string
  type: 'err' | 'info'
  isShow: boolean
}

export interface FormMFARef {
  showToast: (body: string, type: ToastMFAType['type']) => void
}

interface FormMFAProps {
  formFields: FormFields[]
  buttonLabel: string
  disbaled?: boolean
  aboveButton?: JSX.Element
  belowButton?: JSX.Element
  onSubmit?: (values: Record<string, string>) => void
}

export const FormMFA = forwardRef<FormMFARef, FormMFAProps>(
  (
    { formFields, aboveButton, belowButton, buttonLabel, disbaled, onSubmit },
    ref,
  ) => {
    const inputRefs = useRef<Record<string, FieldInputRef | null>>({})
    const [errorFields, setErrorFields] = useState<Record<string, boolean>>({})
    const [toast, setToast] = useState<ToastMFAType>({
      body: '',
      type: 'info',
      isShow: false,
    })

    useImperativeHandle(ref, () => ({
      showToast,
    }))

    const showToast = (body: string, type: ToastMFAType['type']) => {
      onResetState()
      setToast({ type, body, isShow: true })
    }

    const handleSubmit = () => {
      const result: Record<string, string> = {}
      onResetState()
      for (const field of formFields) {
        const value = inputRefs.current[field.id]?.getValue() || ''
        result[field.id] = value
      }
      console.log('Form result:', result)

      onSubmit?.(result)
    }

    const onResetState = () => {
      setToast({ body: '', type: 'info', isShow: false })
      setErrorFields({})
    }

    return (
      <ScrollView
        style={css.Container}
        contentContainerStyle={css.ContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {formFields.map(field => (
          <View key={field.id} style={css.FieldContainer}>
            {field.label && <Text style={css.Label}>{field.label}</Text>}
            <FieldInput
              ref={ref => {
                inputRefs.current[field.id] = ref
              }}
              placeholder={field.placeholder}
              secureTextEntry={field.secureTextEntry}
              keyboardType={field.keyboardType}
              placeholderTextColor={v.layerBg}
              style={[errorFields[field.id] && css.ErrorBorder]}
              editable={field.editable}
              defaultValue={field.defaultValue}
              onFocus={onResetState}
            />
          </View>
        ))}
        {aboveButton}
        <RnTouchableOpacity
          disabled={disbaled}
          style={[css.Button, disbaled && css.Button_Disable]}
          onPress={handleSubmit}
        >
          <RnText white small>
            {upperCase(buttonLabel)}
          </RnText>
        </RnTouchableOpacity>
        {belowButton}
        {toast.isShow && (
          <ToastMFA
            body={toast.body}
            type={toast.type}
            isVisible
            onClose={onResetState}
          />
        )}
      </ScrollView>
    )
  },
)
