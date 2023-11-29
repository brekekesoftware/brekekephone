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
    const tokenNotExist = /#pbx-token#/i.test(cp.url)
    if (tokenNotExist) {
      const url = await this.getUrlParams(cp.url)
      getAuthStore().updateCustomPage({ ...cp, url })
      getAuthStore().customPageLoadings[cp.id] = true
    }
  }

  getUrlParams = async (url: string) => {
    // should be catch getPbxToken when get error
    try {
      const { token } = await pbx.getPbxToken()
      if (!token) {
        return url
      }
      const user = getAuthStore().getCurrentAccount()
      return url
        .replace(/#lang#/i, intlStore.locale)
        .replace(/#pbx-token#/i, token)
        .replace(/#tenant#'/i, user.pbxTenant)
        .replace(/#user#/i, user.pbxUsername)
        .replace(/#from-number#/i, '0')
    } catch (error) {
      return url
    }
  }

  render() {
    return null
  }
}
