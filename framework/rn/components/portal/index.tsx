'use client'

import type { PropsWithChildren } from 'react'
import { Fragment, useEffect, useId, useLayoutEffect } from 'react'

import { PortalContainer } from '@/rn/components/portal/container'
import type { PortalItem } from '@/rn/components/portal/store'
import {
  addPortal,
  removePortal,
  usePortalItems,
} from '@/rn/components/portal/store'
import { isWeb } from '@/rn/core/utils/platform'
import { useIsMounted } from '@/rn/core/utils/use-is-mounted'

export type PortalProps = PropsWithChildren<
  Pick<PortalItem, 'disableBodyScroll'>
>

const Item = ({ children, disableBodyScroll }: PortalProps) => {
  const id = useId()

  useLayoutEffect(() => addPortal(id, children, disableBodyScroll))
  useEffect(() => () => removePortal(id), [id])

  return null
}

const Root = () => {
  const mounted = useIsMounted()
  const items = usePortalItems()
  const disableBodyScroll = isWeb && items.some(e => e.disableBodyScroll)

  useEffect(() => {
    if (!isWeb) {
      return
    }
    document.body.style.overflow = disableBodyScroll ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [disableBodyScroll])

  if (!mounted || items.length === 0) {
    return null
  }

  return (
    <PortalContainer>
      {items.map(e => (
        <Fragment key={e.id}>{e.node}</Fragment>
      ))}
    </PortalContainer>
  )
}

export const Portal = Object.assign(Item, {
  Root,
})
