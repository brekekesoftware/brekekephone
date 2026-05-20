import type { FC } from 'react'
import type { KeyboardAvoidingViewProps } from 'react-native'
import { KeyboardAvoidingView as KeyboardAvoidingViewWocn } from 'react-native'

import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export const RnKeyboardAvoidingView = createClassNameComponent({
  KeyboardAvoidingViewWocn,
}) as FC<KeyboardAvoidingViewProps & { className?: ClassName }>
