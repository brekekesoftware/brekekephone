import { action, observable } from 'mobx'
import { ReactComponentLike } from 'prop-types'
import { SyntheticEvent } from 'react'

import { BackgroundTimer } from '../utils/BackgroundTimer'
import { RnKeyboard } from './RnKeyboard'

export type StackerFn<T> = keyof T extends never
  ? () => void
  : RequiredKeys<T> extends never
  ? (props?: T) => void
  : (props: T) => void

export type RnStack = {
  isRoot?: boolean
  Component: ReactComponentLike
  name: string
}

export class RnStackerStore {
  @observable stacks: RnStack[] = []
  @observable stackAnimating = false

  @action openStack = (stack: RnStack) => {
    if (stack.isRoot) {
      this.stacks = [stack]
    } else {
      this.stacks.push(stack)
    }
  }
  dismiss = RnKeyboard.waitKeyboard(
    action(() => {
      this.stacks.pop()
    }),
  )

  createGoTo = <T>(
    o: { [k: string]: ReactComponentLike },
    isRoot = false,
  ): StackerFn<T> => {
    const keys = Object.keys(o)
    if (keys.length !== 1) {
      throw new Error('RnStacker.registerStack must be called with only 1 key')
    }
    const name = keys[0]
    const Component = o[name]
    const f = RnKeyboard.waitKeyboard(
      action((stack: SyntheticEvent) => {
        // Prevent multiple stacks from opening at the same time
        if (this.stackAnimating) {
          return
        }
        if (!isRoot) {
          this.stackAnimating = true
          BackgroundTimer.setTimeout(() => {
            this.stackAnimating = false
          }, 300)
        }
        //
        const stack0 = {} as RnStack
        // It fails if the param is an event
        //    or something not enumerable
        if (stack && !stack.nativeEvent) {
          try {
            Object.assign(stack0, stack)
          } catch (err) {}
        }
        Object.assign(stack0, {
          name,
          Component,
          isRoot,
        })
        this.openStack(stack0)
      }),
    )
    return f as unknown as StackerFn<T>
  }
  createBackTo =
    <T>(o: { [k: string]: ReactComponentLike }, isRoot = false): StackerFn<T> =>
    (...args: unknown[]) => {
      if (this.stacks.length <= 1) {
        // @ts-ignore
        this.createGoTo(o, isRoot)(...args)
        return
      }
      this.dismiss()
    }
}

export const RnStacker = new RnStackerStore()
