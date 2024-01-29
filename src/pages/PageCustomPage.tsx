import { observer } from 'mobx-react'
import { Component } from 'react'

import { buildCustomPageUrl, isCustomPageUrlBuilt } from '../api/pbx'
import { getAuthStore } from '../stores/authStore'

@observer
export class PageCustomPage extends Component<{ id: string }> {
  componentDidMount = async () => {
    const { id } = this.props
    const as = getAuthStore()
    const cp = as.getCustomPageById(id)
    if (!cp) {
      return
    }
    if (isCustomPageUrlBuilt(cp.url)) {
      return
    }
    const url = await buildCustomPageUrl(cp.url)
    as.updateCustomPage({ ...cp, url })
    as.customPageLoadings[cp.id] = true
  }

  render() {
    return null
  }
}
