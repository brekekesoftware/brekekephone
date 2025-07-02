import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet } from 'react-native'

import { isCustomPageUrlBuilt } from '#/api/customPage'
import {
  buildCustomPageUrl,
  rebuildCustomPageUrlNonce,
  rebuildCustomPageUrlPbxToken,
} from '#/api/pbx'
import type { PbxCustomPage } from '#/brekekejs'
import { CustomPageWebView } from '#/components/CustomPageWebView'
import { Layout } from '#/components/Layout'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnStacker } from '#/stores/RnStacker'

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
    if (ctx.auth.customPageLoadings[cp.id]) {
      return
    }
    ctx.auth.customPageLoadings[cp.id] = true
    if (!cp) {
      return
    }
    const url = rebuildCustomPageUrlNonce(cp.url)
    ctx.auth.updateCustomPage({ ...cp, url })
  }
  reloadPageWithNewToken = async () => {
    const {
      props: { id },
    } = this

    const cp = ctx.auth.getCustomPageById(id)
    if (!cp) {
      return
    }

    // should check if the url is not built in case pbx reconnect
    if (!isCustomPageUrlBuilt(cp.url)) {
      const url = await buildCustomPageUrl(cp.url)
      ctx.auth.updateCustomPage({ ...cp, url })
      return
    }

    const url = await rebuildCustomPageUrlPbxToken(cp.url)
    ctx.auth.updateCustomPage({ ...cp, url })
  }

  render() {
    const {
      props: { id },
    } = this

    const cp = ctx.auth.getCustomPageById(id)
    // trigger when receiving incoming call
    const c = ctx.call.calls.find(i => i.incoming && !i.answeredAt)
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    // update title to tab label
    const onTitle = (t: string) => {
      if (!cp || !isCustomPageUrlBuilt(cp.url)) {
        return
      }
      ctx.auth.updateCustomPage({ ...cp, title: t })
    }

    // handle open custompage tab and reload page when received incoming
    if (
      (c || (!c && ctx.auth.saveActionOpenCustomPage)) &&
      s &&
      cp &&
      cp.incoming === 'open'
    ) {
      ctx.auth.saveActionOpenCustomPage = false
      if (s.name != 'PageCustomPage') {
        // update stacker flow
        ctx.nav.customPageIndex = ctx.nav.goToPageCustomPage
        ctx.nav.goToPageCustomPage({ id: cp.id })
      }
      this.reloadPage(cp)
    }
    // update check loading page
    if (cp && cp.incoming === 'open' && !c) {
      delete ctx.auth.customPageLoadings[cp.id]
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
        ? // TODO:
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
