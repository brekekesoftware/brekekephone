import $ from './_'
import RnKeyboard from './RnKeyboard'

$.extends({
  observable: {
    // isRoot?: boolean
    // Component: ReactComponent
    // name: string
    // ...props?
    stacks: [],
    stackAnimating: false,
  },
  openStack: stack => {
    if (stack.isRoot) {
      $.set('stacks', [stack])
    } else {
      $.set('stacks', s => {
        s.push(stack)
        return s
      })
    }
  },
  registerStacks: ({ isRoot, ...pages }) => {
    const fnMap = Object.entries(pages).reduce((m, [k, v]) => {
      const fn = RnKeyboard.waitKeyboard(stack => {
        // Prevent multiple stacks from opening at the same time
        if ($.stackAnimating) {
          return
        }
        if (!isRoot) {
          $.stackAnimating = true
          window.setTimeout(() => {
            $.stackAnimating = false
          }, 1000)
        }
        //
        let _stack = {}
        // It fails if the param is an event
        //    or something not enumerable
        if (stack && !stack.nativeEvent) {
          try {
            Object.assign(_stack, stack)
          } catch (err) {}
        }
        Object.assign(_stack, {
          Component: v,
          name: k,
          isRoot,
        })
        $.openStack(_stack)
      })
      const backFn = RnKeyboard.waitKeyboard(() => {
        $.set('stacks', s => {
          s.pop()
          return s
        })
      })
      //
      m[`goTo${k}`] = fn
      m[`backTo${k}`] = stack => ($.stacks.length > 1 ? backFn() : fn(stack))
      return m
    }, {})
    $.extends(fnMap)
  },
})
