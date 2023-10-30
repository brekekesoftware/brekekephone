import { random } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { View } from 'react-native'

import { pbx } from '../api/pbx'
import { PbxCustomPage } from '../brekekejs'
import { CustomPageWebView } from '../components/CustomPageWebView'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'
import { RnStacker } from '../stores/RnStacker'

@observer
export class PageCustomPageView extends Component<{ id: string }> {
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
  reLoadPage = async (cp: PbxCustomPage) => {
    const hadToken = !cp.url.includes('#pbx-token#')
    if (!hadToken) {
      const url = await this.getUrlParams(cp.url)
      getAuthStore().updateCustomPage({ ...cp, url })
      getAuthStore().customPageLoadings[cp.id] = true
    } else {
      getAuthStore().reLoadCustomPageById(cp.id)
    }
  }
  reloadPageWithNewToken = async () => {
    const { id } = this.props
    const cp = getAuthStore().getCustomPageById(id)
    if (!cp) {
      return
    }
    const url = await this.getURLToken(cp.url)
    getAuthStore().updateCustomPage({ ...cp, url })
  }
  render() {
    const { id } = this.props
    const au = getAuthStore()
    const cp = au.getCustomPageById(id)
    // Trigger get received incoming call
    const c = getCallStore().calls.find(i => i.incoming && !i.answeredAt)
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]

    const onTitleChanged = (t: string) => {
      // Update title to tab label
      if (!cp) {
        return
      }
      au.updateCustomPage({ ...cp, title: t })
    }

    const onLoaded = () => {}

    // handle open custompage tab and reload page when received incoming
    if (c && s && cp && cp.incoming === 'open') {
      if (s.name != 'PageCustomPage') {
        // update stacker flow
        Nav().goToPageCustomPage({ id: cp.id })
      }
      // reloadPage
      this.reLoadPage(cp)
    }
    // update check loading page
    if (cp && cp.incoming === 'open' && !c) {
      delete au.customPageLoadings[cp.id]
    }

    const isVisible =
      s &&
      cp &&
      s.isRoot &&
      s.name == 'PageCustomPage' &&
      RnStacker.stacks.length == 1

    return (
      <View
        style={
          !isVisible
            ? { width: 0, marginLeft: -100 }
            : { width: '100%', height: '100%' }
        }
      >
        <Layout
          description={cp?.title}
          menu={'settings'}
          dropdown={[
            {
              label: intl`Reload`,
              onPress: this.reloadPageWithNewToken,
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
      </View>
    )
  }
}
