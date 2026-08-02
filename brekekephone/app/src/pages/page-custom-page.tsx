import { observer } from 'mobx-react'
import { useEffect } from 'react'

import { ctx } from '@/stores/ctx'

export const PageCustomPage = observer((p: { id: string }) => {
  useEffect(() => {
    void ctx.auth.ensureCustomPageUrlBuilt(p.id)
  }, [p.id])

  return null
})
