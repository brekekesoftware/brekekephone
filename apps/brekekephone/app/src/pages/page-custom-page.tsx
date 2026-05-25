import { observer } from 'mobx-react'
import { useEffect } from 'react'

import { ctx } from '#/stores/ctx'

export const PageCustomPage = observer((p: { id: string }) => {
  useEffect(() => {
    const cp = ctx.auth.getCustomPageById(p.id)
    if (!cp) {
      return
    }
    ctx.pbx.buildCustomPageUrl(cp.url).then(url => {
      ctx.auth.updateCustomPage({ ...cp, url })
      ctx.auth.customPageLoadings[cp.id] = true
    })
  }, [p.id])

  return null
})
