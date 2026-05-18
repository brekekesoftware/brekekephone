import type { PropsWithChildren } from 'react'
import { Modal } from 'react-native'

export const PortalContainer = ({ children }: PropsWithChildren) => (
  // use modal to fix adroid inset-0 fills from below the status bar
  <Modal transparent visible animationType='none' statusBarTranslucent>
    {children}
  </Modal>
)
