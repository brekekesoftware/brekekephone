import type { ReactElement } from 'react'
import type { TextInputProps } from 'react-native'

import type { InputProps } from '@/rn/core/components/input'
import { Input } from '@/rn/core/components/input'
import { isWeb } from '#/config'

// Loose `ref` for legacy callers using `useRef<HTMLInputElement>` (web bias).
export type RnTextInputProps = Omit<InputProps, 'ref'> & {
  ref?: any
  disabled?: boolean
}

export const RnTextInput = ({
  className,
  keyboardType,
  ...props
}: RnTextInputProps): ReactElement => (
  <Input
    autoCapitalize='none'
    {...props}
    keyboardType={
      (isWeb ? null : keyboardType) as TextInputProps['keyboardType']
    }
    className={[
      'placeholder-slate-400 text-foreground relative font-sans text-sm font-normal',
      className,
    ]}
  />
)
