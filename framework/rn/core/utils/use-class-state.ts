'use client'

import { mergeDefault } from '@/rn/core/utils/merge-default'
import { useRefConstruct } from '@/rn/core/utils/use-ref-construct'
import type { Updater } from '@/rn/immer'
import { immer, useImmer } from '@/rn/immer'
import type {
  NoExtra,
  OmitUndefined,
  PartialDefaultProps,
} from '@/shared/ts-utils'

export interface ClassComponent<Props = never, State = never> {
  props: Props
  state: State
  useHooks?: () => void
}

export const closureUseClassState = <
  Props,
  State,
  Instance extends ClassComponent<Props, State>,
  DefaultProps extends Partial<Props> = never,
>(
  Constructor: {
    new (props: Props, state: State, setState: Updater<State>): Instance
    defaultProps?: NoExtra<Props, DefaultProps>
  } & (keyof OmitUndefined<State> extends never
    ? { getInitialState?: (props: Props) => OmitUndefined<State> }
    : { getInitialState: (props: Props) => OmitUndefined<State> }),
) => {
  const { defaultProps, getInitialState } = Constructor
  const useClassState = (
    props: PartialDefaultProps<Props, keyof DefaultProps>,
  ) => {
    const p = mergeDefault(props, defaultProps) as Props
    const initialState = useRefConstruct(() => getInitialState?.(p) || {})
    const [s, setState] = useImmer(initialState as State)
    const v = useRefConstruct(() => {
      const instance = new Constructor(p, s, fn => {
        // make sure state is always synchronous
        const newState = immer(instance.state, fn as any)
        instance.state = newState
        return setState(() => newState)
      })
      return instance
    })
    v.props = p
    v.state = s
    v.useHooks?.()
    return v
  }
  return useClassState
}
