'use client'

import type { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

export const PortalContainer = ({ children }: PropsWithChildren) =>
  createPortal(children, document.body)
