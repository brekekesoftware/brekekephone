import { observer } from 'mobx-react'
import { Component } from 'react'

import { ctx } from '#/stores/ctx'

@observer
export class PageCustomPage extends Component<{ id: string }> {
  componentDidMount = async () => {
    const { id } = this.props
    const cp = ctx.auth.getCustomPageById(id)
    if (!cp) {
      return
    }

    const url = await ctx.pbx.buildCustomPageUrl(cp.url)
    ctx.auth.updateCustomPage({ ...cp, url })
    ctx.auth.customPageLoadings[cp.id] = true
  }

  render() {
    return null
  }
}
