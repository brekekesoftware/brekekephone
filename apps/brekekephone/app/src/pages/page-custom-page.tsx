import { observer } from 'mobx-react'
import { useEffect } from 'react'

import { ctx } from '#/stores/ctx'

export const PageCustomPage = observer((p: { id: string }) => {
  useEffect(() => {
    let cancelled = false
    const cp = ctx.auth.getCustomPageById(p.id)
    if (!cp) {
      return
    }
    ctx.pbx.buildCustomPageUrl(cp.url).then(url => {
      if (cancelled) {
        return
      }
      ctx.auth.updateCustomPage({ ...cp, url })
      ctx.auth.customPageLoadings[cp.id] = true
    })
    return () => {
      cancelled = true
    }
  }, [p.id])

  return null
})
