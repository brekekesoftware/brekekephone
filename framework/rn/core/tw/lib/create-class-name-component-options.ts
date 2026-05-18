import type { CreateClassNameComponentOptions } from '@/rn/core/tw/lib/create-class-name-component'
import type { StrMap } from '@/shared/ts-utils'

type Return = CreateClassNameComponentOptions & {
  Component: any
  displayName: string
}

export const createClassNameComponentOptions = ({
  extraClassNameKeys,
  ...options
}: StrMap): Return => {
  const keys = Object.keys(options)
  const displayName = keys[0]
  const Component = options[displayName]

  if (process.env.NODE_ENV !== 'production') {
    if (keys.length !== 1 || !displayName.endsWith('Wocn')) {
      const k = keys.join(', ')
      console.error(
        `Expect create class name component options should have Wocn component, found: ${k}`,
      )
    }
    if (!Component) {
      console.error(
        'Expect Wocn component to be present in create class name component options',
      )
    }
  }

  return {
    extraClassNameKeys,
    Component,
    displayName: displayName.replace(/Wocn$/, ''),
  }
}
