import { random } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { pbx } from '../api/pbx'
import { CustomPageWebView } from '../components/CustomPageWebView'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'

@observer
export class PageCustomPage extends Component<{ id: string }> {
  state = {
    url: '',
  }
  componentDidMount = async () => {
    const { id } = this.props
    const cp = getAuthStore().getCustomPageById(id)
    if (!cp) {
      return
    }
    const hadToken = !cp.url.includes('#pbx-token#')
    if (!hadToken) {
      const url = await this.getUrlParams(cp.url)
      getAuthStore().updateCustomPage({ ...cp, url })
      this.setState({ url })
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
  getURLToken = async (url: string) => {
    const r = random(1, 1000, false).toString()
    const { token } = await pbx.getPbxToken()
    if (!token) {
      return url
    }
    return url
      .replace(/&sess=(.*?)&/, `&sess=${token}&`)
      .replace(/&from-number=([0-9]+)/, `&from-number=${r}`)
  }
  reloadPage = async () => {
    const { id } = this.props
    const cp = getAuthStore().getCustomPageById(id)
    if (!cp) {
      return
    }
    const url = await this.getURLToken(cp.url)
    getAuthStore().updateCustomPage({ ...cp, url })
    this.setState({ url })
  }
  render() {
    const { id } = this.props
    const cp = getAuthStore().getCustomPageById(id)

    const onTitleChanged = (t: string) => {
      this.setState({ title: t })
      // Update title to tab label
      if (!cp) {
        return
      }
      getAuthStore().updateCustomPage({ ...cp, title: t })
    }

    const onLoaded = () => {
      // getAuthStore().customPageLoadings[id] = false
    }

    console.log('thangnt::', { url: cp?.url })

    return (
      <Layout
        description={cp?.title}
        menu={'settings'}
        dropdown={[
          {
            label: intl`Reload`,
            onPress: this.reloadPage,
          },
        ]}
        subMenu={id}
        title={intl`Custom Page`}
        isFullContent
      >
        {cp && (
          <CustomPageWebView
            url={cp.url}
            onTitleChanged={onTitleChanged}
            onLoadEnd={onLoaded}
          />
        )}
      </Layout>
    )
  }
}
