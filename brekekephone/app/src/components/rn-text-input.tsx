import type { ReactElement } from 'react'
import type { TextInputProps } from 'react-native'
import { isWeb } from 'rntwsc/platform'
import type { InputProps } from 'rntwsc/tw/components/input'
import { Input } from 'rntwsc/tw/components/input'

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
      'text-foreground relative font-sans text-sm font-normal placeholder-slate-400',
      className,
    ]}
  />
)
