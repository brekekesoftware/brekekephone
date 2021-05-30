import { action, observable } from 'mobx'
import { ReactComponentLike } from 'prop-types'
import { SyntheticEvent } from 'react'

import RnKeyboard from './RnKeyboard'

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

  createGoTo = (o: { [k: string]: ReactComponentLike }, isRoot = false) => {
    const keys = Object.keys(o)
    if (keys.length !== 1) {
      throw new Error('RnStacker.registerStack must be called with only 1 key')
    }
    const name = keys[0]
    const Component = o[name]
    return RnKeyboard.waitKeyboard(
      action((stack: SyntheticEvent) => {
        // Prevent multiple stacks from opening at the same time
        if (this.stackAnimating) {
          return
        }
        if (!isRoot) {
          this.stackAnimating = true
          window.setTimeout(() => {
            this.stackAnimating = false
          }, 1000)
        }
        //
        let _stack = {} as RnStack
        // It fails if the param is an event
        //    or something not enumerable
        if (stack && !stack.nativeEvent) {
          try {
            Object.assign(_stack, stack)
          } catch (err) {}
        }
        Object.assign(_stack, {
          name,
          Component,
          isRoot,
        })
        this.openStack(_stack)
      }),
    )
  }
  createBackTo =
    (o: { [k: string]: ReactComponentLike }, isRoot = false) =>
    (...args: unknown[]) => {
      if (this.stacks.length > 1) {
        RnKeyboard.waitKeyboard(this.dismiss)()
      } else {
        this.createGoTo(o, isRoot)(...args)
      }
    }
  popAllStack = RnKeyboard.waitKeyboard(
    action(() => {
      while (this.stacks.length > 1) {
        this.stacks.pop()
      }
    }),
  )
  backToFirstStack = () => {
    if (this.stacks.length > 1) {
      RnKeyboard.waitKeyboard(this.popAllStack)()
    }
  }
}

export default new RnStackerStore()
