import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { ActivityIndicator } from 'react-native'

import { TwPeerProvider } from '@/rn/core/tw/marker.native'
import { BrekekeGradient } from '#/components/brekeke-gradient'
import { RnText } from '#/components/rn-text'
import { RootView } from '#/components/root-view'
import { ToastRoot } from '#/components/toast-root'
import { PageCallManage } from '#/pages/page-call-manage'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlertRoot } from '#/stores/rn-alert-root'
import { RnPickerRoot } from '#/stores/rn-picker-root'
import { BrekekeUtils } from '#/utils/brekeke-utils'

type IncomingCallRootProps = {
  uuid?: string
  callerName?: string
  pnId?: string
}

// root component for the "IncomingCall" surface mounted by
// IncomingCallActivity after answer (pre-warmed hidden while ringing).
// it shares the js runtime with the main "BrekekePhone" root so all stores
// are the same instances; only the view tree is separate, which is why the
// overlay hosts (toast/picker/alert) must be mounted here as well.
// the nav stack (RnStackerRoot) intentionally stays in the main root: nav
// actions go through PageCallManage.navOnMain -> BrekekeUtils.openMainActivity
const IncomingCallSurface = observer((p: IncomingCallRootProps) => {
  // pnId fallback: callkeepUuid is assigned late and can fail to associate
  // on pn parse edge cases, while pnId is set on the call at upsert
  const c = ctx.call.calls.find(
    _ =>
      _.callkeepUuid === p.uuid || (!!p.pnId && !!_.pnId && _.pnId === p.pnId),
  )
  // close the activity directly when our call leaves the store: do not
  // depend on the endCallKeep timing which can miss the uuid association
  const hadCallRef = useRef(false)
  useEffect(() => {
    if (c) {
      hadCallRef.current = true
      return
    }
    if (hadCallRef.current && p.uuid) {
      BrekekeUtils.closeIncomingCall(p.uuid)
    }
  }, [c, p.uuid])
  return (
    <RootView>
      {c ? (
        <PageCallManage call={c} embedded />
      ) : (
        // the sip call may land later than the answer tap (app killed case)
        <BrekekeGradient className='items-center justify-center'>
          {!!p.callerName && (
            <RnText title white center className='mb-5'>
              {p.callerName}
            </RnText>
          )}
          <ActivityIndicator size='large' color='white' />
          <RnText small white center className='mt-2.5'>
            {intl`Connecting...`}
          </RnText>
        </BrekekeGradient>
      )}
      <ToastRoot />
      <RnPickerRoot />
      <RnAlertRoot />
    </RootView>
  )
})

export const IncomingCallRoot = (p: IncomingCallRootProps) => (
  <TwPeerProvider>
    <IncomingCallSurface {...p} />
  </TwPeerProvider>
)
