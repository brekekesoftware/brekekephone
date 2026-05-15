import type { ComponentType, PropsWithChildren } from 'react'

export const composeProviders = (
  ...arr: ComponentType<PropsWithChildren<any>>[]
): ComponentType<PropsWithChildren> =>
  arr.length === 1
    ? arr[0]
    : ({ children }) =>
        arr.reduceRight(
          (accumulatedChildren, Provider) => (
            <Provider>{accumulatedChildren}</Provider>
          ),
          children,
        )
