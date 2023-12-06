import { observer } from 'mobx-react'
import { Component } from 'react'
import { View } from 'react-native'

import {
  isCustomPageUrlBuilt,
  rebuildCustomPageUrl,
  rebuildCustomPageUrlNonce,
} from '../api/pbxCustomPage'
import { PbxCustomPage } from '../brekekejs'
import { CustomPageWebView } from '../components/CustomPageWebView'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnStacker } from '../stores/RnStacker'

@observer
export class PageCustomPageView extends Component<{ id: string }> {
  reloadPage = async (cp: PbxCustomPage) => {
    if (!isCustomPageUrlBuilt(cp.url)) {
      return
    }
    const as = getAuthStore()
    if (as.customPageLoadings[cp.id]) {
      return
    }
    as.customPageLoadings[cp.id] = true
    if (!cp) {
      return
    }
    const url = rebuildCustomPageUrlNonce(cp.url)
    as.updateCustomPage({ ...cp, url })
  }
  reloadPageWithNewToken = async () => {
    const {
      props: { id },
    } = this
    const as = getAuthStore()
    const cp = as.getCustomPageById(id)
    if (!cp) {
      return
    }
    const url = await rebuildCustomPageUrl(cp.url)
    as.updateCustomPage({ ...cp, url })
  }

  render() {
    const {
      props: { id },
    } = this
    const as = getAuthStore()
    const cp = as.getCustomPageById(id)
    // trigger when receiving incoming call
    const c = getCallStore().calls.find(i => i.incoming && !i.answeredAt)
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    // update title to tab label
    const onTitleChanged = (t: string) => {
      if (!cp || !isCustomPageUrlBuilt(cp.url)) {
        return
      }
      as.updateCustomPage({ ...cp, title: t })
    }

    const onLoadEnd = () => {}
    const onError = () => {}

    // handle open custompage tab and reload page when received incoming
    if (
      (c || (!c && as.saveActionOpenCustomPage)) &&
      s &&
      cp &&
      cp.incoming === 'open'
    ) {
      as.saveActionOpenCustomPage = false
      if (s.name != 'PageCustomPage') {
        // update stacker flow
        Nav().customPageIndex = Nav().goToPageCustomPage
        Nav().goToPageCustomPage({ id: cp.id })
      }
      this.reloadPage(cp)
    }
    // update check loading page
    if (cp && cp.incoming === 'open' && !c) {
      delete as.customPageLoadings[cp.id]
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
          menu='settings'
          subMenu={id}
          dropdown={[
            {
              label: intl`Reload`,
              onPress: this.reloadPageWithNewToken,
            },
          ]}
          title={intl`Custom Page`}
          isFullContent
        >
          {!!cp?.url && isCustomPageUrlBuilt(cp.url) && (
            <CustomPageWebView
              url={cp.url}
              onTitleChanged={onTitleChanged}
              onLoadEnd={onLoadEnd}
              onError={onError}
            />
          )}
        </Layout>
      </View>
    )
  }
}
