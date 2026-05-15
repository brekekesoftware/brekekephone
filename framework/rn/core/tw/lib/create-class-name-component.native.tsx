import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { CommonProps } from '@/rn/core/components/lib/common-props'
import { useDarkModeState } from '@/rn/core/dark-mode/use-dark-mode-state'
import { useResponsiveState } from '@/rn/core/responsive/use-responsive-state'
import { useThemeVariables } from '@/rn/core/theme/use-theme-variables'
import type {
  ClassName,
  ClassNameDarkModeState,
  ClassNameHandlerSelector,
  ClassNameMarker,
  ClassNameMarkerState,
  ClassNameMetadata,
  ClassNamePropsState,
  ClassNameResponsiveState,
  ClassNameState,
  ClassNameWithSelector,
  StyleSingle,
} from '@/rn/core/tw/class-name'
import {
  darkModeSelectorsSet,
  emptyMarkerKey,
  handlerSelectors,
  handlerSelectorsSet,
  markers,
  propsSelectors,
  propsSelectorsSet,
  responsiveSelectorsSet,
} from '@/rn/core/tw/lib/class-name-to-native'
import type { ClassNameToStylesOptions } from '@/rn/core/tw/lib/class-name-to-styles'
import type { CreateClassNameComponentOptions } from '@/rn/core/tw/lib/create-class-name-component'
import { createClassNameComponentOptions } from '@/rn/core/tw/lib/create-class-name-component-options'
import {
  MarkerGroupProvider,
  useMarkerGroupState,
  useMarkerPeerSetState,
  useMarkerPeerState,
} from '@/rn/core/tw/lib/marker.native'
import { runtimeStyle } from '@/rn/core/tw/runtime-style'
import { get, isEqual } from '@/shared/lodash'
import type { Falsish, StrMap } from '@/shared/ts-utils'

type Props = Pick<CommonProps, 'twStableProvider'> & StrMap

export const createClassNameComponent = ({
  extraClassNameKeys,
  ...options
}: CreateClassNameComponentOptions) => {
  const { Component, displayName } = createClassNameComponentOptions(options)

  const Outer = async ({ twStableProvider, ...props }: Props) => {
    const classNameKeys = ['className']
    const styleKeys = ['style']

    extraClassNameKeys?.forEach(k => {
      if (process.env.NODE_ENV !== 'production') {
        if (!k.endsWith('ClassName')) {
          console.error(
            `Expect extra class name keys should end with ClassName, found: ${k}`,
          )
        }
      }
      classNameKeys.push(k)
      styleKeys.push(k.replace(/ClassName$/, 'Style'))
    })

    const propsState: ClassNamePropsState = {}
    for (const k of propsSelectors) {
      if (props[k]) {
        propsState[k] = true
      }
    }

    // theme is rarely changed, so we can just get it here
    // other selectors should be checked in inner component and only wrap when necessary
    const variables = await useThemeVariables()

    return (
      <ClassNameComponent
        Component={Component}
        props={props}
        classNameKeys={classNameKeys}
        styleKeys={styleKeys}
        // initial state is the props state where we can get from the props
        state={propsState}
        // theme is rarely changed, so we can just get it here
        // other selectors should be checked in inner component and only wrap when necessary
        variables={variables}
        // pass metadata to try to collect class name selector dependencie
        metadata={getInitialMetadata(twStableProvider)}
      />
    )
  }

  Outer.displayName = displayName
  return Outer
}

type ClassNameComponentProps = Pick<ClassNameToStylesOptions, 'variables'> & {
  Component: any
  props: any
  classNameKeys: string[]
  styleKeys: string[]
  state: ClassNameState
  metadata?: ClassNameMetadata
}

const ClassNameComponent = ({
  Component,
  props,
  classNameKeys,
  styleKeys,
  state,
  variables,
  metadata,
}: ClassNameComponentProps) => {
  const styles = classNameKeys.map((k, i) => {
    const sk = styleKeys[i]
    return runtimeStyleWithMetadata({
      className: props[k],
      style: props[sk],
      state,
      variables,
      metadata,
      extraClassNameKey: i ? k : undefined,
    })
  })

  if (!metadata || !Object.keys(metadata).length) {
    props = { ...props }
    classNameKeys.forEach((k, i) => {
      const sk = styleKeys[i]
      props[sk] = styles[i]
      delete props[k]
    })
    return <Component {...props} />
  }

  return (
    <ClassNameComponentWithMetadata
      Component={Component}
      props={props}
      classNameKeys={classNameKeys}
      styleKeys={styleKeys}
      state={state}
      variables={variables}
      metadata={metadata}
    />
  )
}

type ClassNameComponentWithMetadataProps = Required<ClassNameComponentProps>
const ClassNameComponentWithMetadata = ({
  Component,
  props,
  classNameKeys,
  styleKeys,
  state,
  variables,
  metadata,
}: ClassNameComponentWithMetadataProps) => {
  let Inner: FC<InnerProps> = InitialInner

  const innerRef = useRef(Inner)
  const metadataRef = useRef<ClassNameMetadata>(undefined)

  if (shouldRerenderMetadata(metadataRef.current, metadata)) {
    // metadata should be stable
    if (process.env.NODE_ENV !== 'production' && metadataRef.current) {
      console.error(
        'Expect class names with selector should be stable, consider to reorganize to make them stable, or use twStableProvider on this component to subscribe to all selectors',
      )
    }

    // need to be in reversed order so the providers can get value from handlers
    if (metadata.groupProviders?.length) {
      Inner = withGroupProvider(Inner)
    }
    if (metadata.peerProviders?.length) {
      Inner = withPeerProvider(Inner)
    }
    if (metadata.active) {
      Inner = withActive(Inner)
    }
    if (metadata.focus) {
      Inner = withFocus(Inner)
    }

    // the rest are global and independent
    if (metadata.responsive) {
      Inner = withResponsive(Inner)
    }
    if (metadata.darkMode) {
      Inner = withDarkMode(Inner)
    }
    if (metadata.group) {
      Inner = withGroup(Inner)
    }
    if (metadata.peer) {
      Inner = withPeer(Inner)
    }

    innerRef.current = Inner
    metadataRef.current = metadata
  }
  Inner = innerRef.current

  return (
    <Inner
      outer={{
        Component,
        props,
        classNameKeys,
        styleKeys,
        state,
        variables,
        metadata,
      }}
    />
  )
}

type InnerProps = {
  outer: ClassNameComponentWithMetadataProps
  responsiveState?: ClassNameResponsiveState
  darkModeState?: ClassNameDarkModeState
  active?: boolean
  focus?: boolean
  groupState?: ClassNameMarkerState
  peerState?: ClassNameMarkerState
  handlers?: {
    onPressIn?: () => void
    onPressOut?: () => void
    onFocus?: () => void
    onBlur?: () => void
  }
}

const InitialInner = ({
  outer: { Component, props, classNameKeys, styleKeys, state, variables },
  responsiveState,
  darkModeState,
  active,
  focus,
  handlers,
  groupState,
  peerState,
}: InnerProps) => (
  <ClassNameComponent
    Component={Component}
    props={composeHandlers(props, handlers)}
    classNameKeys={classNameKeys}
    styleKeys={styleKeys}
    state={{
      ...state,
      ...responsiveState,
      ...darkModeState,
      active,
      focus,
      ...groupState,
      ...peerState,
    }}
    variables={variables}
    // remove metadata to actual compute the style in above class name component with the correct state
    metadata={undefined}
  />
)

const withResponsive = (Inner: FC<InnerProps>) => (props: InnerProps) => {
  const responsiveState = useResponsiveState()
  return <Inner {...props} responsiveState={responsiveState} />
}

const withDarkMode = (Inner: FC<InnerProps>) => async (props: InnerProps) => {
  const darkModeState = await useDarkModeState()
  return <Inner {...props} darkModeState={darkModeState} />
}

const withActive =
  (Inner: FC<InnerProps>) =>
  ({ handlers, ...props }: InnerProps) => {
    const [active, setActive] = useState(false)
    return (
      <Inner
        {...props}
        active={active}
        handlers={{
          ...handlers,
          onPressIn: () => setActive(true),
          onPressOut: () => setActive(false),
        }}
      />
    )
  }

const withFocus =
  (Inner: FC<InnerProps>) =>
  ({ handlers, ...props }: InnerProps) => {
    const [focus, setFocus] = useState(false)
    return (
      <Inner
        {...props}
        focus={focus}
        handlers={{
          ...handlers,
          onFocus: () => setFocus(true),
          onBlur: () => setFocus(false),
        }}
      />
    )
  }

const withGroup = (Inner: FC<InnerProps>) => (props: InnerProps) => {
  const groupState = useMarkerGroupState()
  return <Inner {...props} groupState={groupState} />
}

const withPeer = (Inner: FC<InnerProps>) => (props: InnerProps) => {
  const peerState = useMarkerPeerState()
  return <Inner {...props} peerState={peerState} />
}

const withGroupProvider = (Inner: FC<InnerProps>) => (props: InnerProps) => {
  const state = getMarkerProviderState('group', props)
  if (!state) {
    // should not happen
    return <Inner {...props} />
  }
  return (
    <MarkerGroupProvider state={state}>
      <Inner {...props} />
    </MarkerGroupProvider>
  )
}

const withPeerProvider = (Inner: FC<InnerProps>) => (props: InnerProps) => {
  const state = getMarkerProviderState('peer', props)
  const stateRef = useRef<ClassNameMarkerState>(undefined)

  const stateState = useMarkerPeerSetState()

  useEffect(() => {
    if (isEqual(state, stateRef.current)) {
      return
    }
    const prev = stateRef.current
    stateRef.current = state
    stateState(d => {
      if (prev) {
        for (const k in prev) {
          delete d[k]
        }
      }
      for (const k in state) {
        d[k] = true
      }
    })
  })

  useEffect(
    () => () => {
      const prev = stateRef.current
      if (!prev) {
        return
      }
      stateState(d => {
        for (const k in prev) {
          delete d[k]
        }
      })
    },
    [],
  )

  return <Inner {...props} />
}

const getMarkerProviderState = (marker: ClassNameMarker, props: InnerProps) => {
  const keys = props.outer.metadata[`${marker}Providers`]
  if (!keys?.length) {
    // should not happen
    return
  }
  const state: ClassNameMarkerState = {}
  for (const k of keys) {
    for (const selector of handlerSelectors) {
      if (props[selector]) {
        state[`${k}-${selector}`] = true
      }
    }
    for (const selector of propsSelectors) {
      if (props.outer.state[selector]) {
        state[`${k}-${selector}`] = true
      }
    }
  }
  return state
}

const composeHandlers = (props: any, handlers: StrMap<Function> | Falsish) => {
  if (!handlers) {
    return props
  }
  // clone to modify
  props = { ...props }
  for (const [k, extraHandler] of Object.entries(handlers)) {
    const originalHandler = props[k]
    props[k] = (e: any) => {
      originalHandler?.(e)
      extraHandler(e)
    }
  }
  return props
}

type RuntimeStyleWithMetadataOptions = Pick<
  ClassNameComponentProps,
  'state' | 'variables' | 'metadata'
> & {
  className: ClassName
  style: StyleSingle
  extraClassNameKey?: string
}

const runtimeStyleWithMetadata = ({
  className,
  style,
  state,
  variables,
  ...options
}: RuntimeStyleWithMetadataOptions) =>
  runtimeStyle(className, {
    style,
    state,
    variables,
    onSelector: selector =>
      onSelectorWithMetadata({
        className: selector,
        state,
        ...options,
      }),
    warnOnString: true,
  })

type OnSelectorWithMetadataOptions = Pick<
  RuntimeStyleWithMetadataOptions,
  'state' | 'metadata' | 'extraClassNameKey'
> & {
  className: ClassNameWithSelector
}

const onSelectorWithMetadata = ({
  className: { selector, style },
  state,
  extraClassNameKey,
  metadata,
}: OnSelectorWithMetadataOptions) => {
  // platform selector
  if (selector === true) {
    return style
  }

  const notSupportedInExtra = () => {
    if (!extraClassNameKey) {
      return
    }
    console.error(`Expect no ${selector}: selector in ${extraClassNameKey}`)
  }
  if (process.env.NODE_ENV !== 'production') {
    if (handlerSelectorsSet.has(selector) || propsSelectorsSet.has(selector)) {
      notSupportedInExtra()
    }
  }

  if (responsiveSelectorsSet.has(selector)) {
    if (metadata) {
      metadata.responsive = true
      return style
    }
    return state[selector] && style
  }

  if (darkModeSelectorsSet.has(selector)) {
    if (metadata) {
      metadata.darkMode = true
      return style
    }
    return state[selector] && style
  }

  if (handlerSelectorsSet.has(selector)) {
    if (metadata) {
      metadata[selector as ClassNameHandlerSelector] = true
      return style
    }
    return state[selector] && style
  }

  if (propsSelectorsSet.has(selector)) {
    // we can pass props in metadata mode and dont need to collect those metadata
    return state[selector] && style
  }

  for (const marker of markers) {
    if (!selector.startsWith(marker)) {
      continue
    }

    // empty -> marker provider
    // not empty -> marker selector
    if (!get(style, emptyMarkerKey, false)) {
      if (metadata) {
        metadata[marker] = true
        return style
      }
      return state[selector] && style
    }

    if (process.env.NODE_ENV !== 'production') {
      notSupportedInExtra()
    }

    if (metadata) {
      const k = `${marker}Providers` as const
      let providers = metadata[k]
      if (!providers) {
        providers = []
        metadata[k] = providers
      }
      providers.push(selector)
    }

    // provider will not have any style
    return
  }

  // should not happen
  throw new Error(`Unknown selector ${selector}:`)
}

const getInitialMetadata = (
  stableProvider: boolean | Falsish,
): ClassNameMetadata => {
  if (!stableProvider) {
    return {}
  }
  return {
    responsive: true,
    darkMode: true,
    active: true,
    focus: true,
    group: true,
    peer: true,
    groupProviders: ['-'],
    peerProviders: ['-'],
  }
}
const shouldRerenderMetadata = (
  a: ClassNameMetadata | Falsish,
  b: ClassNameMetadata | Falsish,
) => {
  const normalize = (m: ClassNameMetadata | Falsish) =>
    m && {
      ...m,
      groupProviders: m.groupProviders?.length ? true : undefined,
      peerProviders: m.peerProviders?.length ? true : undefined,
    }
  return !isEqual(normalize(a), normalize(b))
}
