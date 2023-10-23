import { observer } from 'mobx-react'
import { Component } from 'react'

import { pbx } from '../api/pbx'
import { getAuthStore } from '../stores/authStore'
import { intlStore } from '../stores/intlStore'

@observer
export class PageCustomPage extends Component<{ id: string }> {
  componentDidMount = async () => {
    const { id } = this.props
    const cp = getAuthStore().getCustomPageById(id)
    if (!cp) {
      return
    }
    // First time open tab PageCustomPage, should update url with params
    const hadToken = !cp.url.includes('#pbx-token#')
    if (!hadToken) {
      const url = await this.getUrlParams(cp.url)
      getAuthStore().updateCustomPage({ ...cp, url })
    }
  }

  getUrlParams = async (url: string) => {
    const token = await pbx.getPbxToken()
    const user = getAuthStore().getCurrentAccount()
    return url
      .replace('#lang#', intlStore.locale)
      .replace('#pbx-token#', token.token)
      .replace('#tenant#', user.pbxTenant)
      .replace('#user#', user.pbxUsername)
      .replace('#from-number#', '0')
  }

  render() {
    return null
  }
}
