import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet } from 'react-native'

import { isCustomPageUrlBuilt } from '../api/customPage'
import {
  buildCustomPageUrl,
  rebuildCustomPageUrlNonce,
  rebuildCustomPageUrlPbxToken,
} from '../api/pbx'
import type { PbxCustomPage } from '../brekekejs'
import { CustomPageWebView } from '../components/CustomPageWebView'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnStacker } from '../stores/RnStacker'

const css = StyleSheet.create({
  invisible: {
    top: '-100%',
    left: '-100%',
  },
})

@observer
export class PageCustomPageView extends Component<{ id: string }> {
  state = {
    webviewLoading: false,
    webviewError: false,
    jsLoading: false,
  }
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

    // It should be checked whether the URL is built or not
    if (!isCustomPageUrlBuilt(cp.url)) {
      const url = await buildCustomPageUrl(cp.url)
      as.updateCustomPage({ ...cp, url })
      return
    }

    const url = await rebuildCustomPageUrlPbxToken(cp.url)
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
    const onTitle = (t: string) => {
      if (!cp || !isCustomPageUrlBuilt(cp.url)) {
        return
      }
      as.updateCustomPage({ ...cp, title: t })
    }

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

    // onLoadEnd not fire with website load image from url camera
    // so, should be check loading like bellow
    const loaded = !this.state.jsLoading || !this.state.webviewLoading

    const title = cp?.title
      ? cp.title
      : !loaded
        ? intl`Loading...`
        : intl`PBX user settings`
    const description = !loaded
      ? intl`Loading...`
      : this.state.webviewError
        ? // TODO
          ''
        : ''

    return (
      <Layout
        title={title}
        description={description}
        menu='settings'
        subMenu={id}
        dropdown={[
          {
            label: intl`Reload`,
            onPress: this.reloadPageWithNewToken,
          },
        ]}
        isFullContent
        style={isVisible ? undefined : css.invisible}
      >
        {!!cp?.url && isCustomPageUrlBuilt(cp.url) && (
          <CustomPageWebView
            url={cp.url}
            onTitle={onTitle}
            onJsLoading={jsLoading => this.setState({ jsLoading })}
            onLoadStart={() => this.setState({ webviewLoading: true })}
            onLoadEnd={e =>
              this.setState({
                webviewLoading: false,
                webviewError:
                  e &&
                  'code' in e.nativeEvent &&
                  typeof e.nativeEvent.code === 'number',
              })
            }
            onError={() => this.setState({ webviewError: true })}
          />
        )}
      </Layout>
    )
  }
}
