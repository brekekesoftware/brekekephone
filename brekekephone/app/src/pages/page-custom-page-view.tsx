import { observer } from 'mobx-react'
import { useState } from 'react'

import { isCustomPageUrlBuilt } from '#/api/custom-page'
import type { PbxCustomPage } from '#/brekekejs'
import { CustomPageWebView } from '#/components/custom-page-web-view'
import { Layout } from '#/components/layout'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnStacker } from '#/stores/rn-stacker'

export const PageCustomPageView = observer(({ id }: { id: string }) => {
  const [webviewLoading, setWebviewLoading] = useState(false)
  const [webviewError, setWebviewError] = useState(false)
  const [jsLoading, setJsLoading] = useState(false)

  const reloadPage = async (cp: PbxCustomPage) => {
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
    const url = ctx.pbx.rebuildCustomPageUrlNonce(cp.url)
    ctx.auth.updateCustomPage({
      ...cp,
      url,
    })
  }
  const reloadPageWithNewToken = async () => {
    const cp = ctx.auth.getCustomPageById(id)
    if (!cp) {
      return
    }

    // should check if the url is not built in case pbx reconnect
    if (!isCustomPageUrlBuilt(cp.url)) {
      const url = await ctx.pbx.buildCustomPageUrl(cp.url)
      ctx.auth.updateCustomPage({
        ...cp,
        url,
      })
      return
    }

    const url = await ctx.pbx.rebuildCustomPageUrlPbxToken(cp.url)
    ctx.auth.updateCustomPage({
      ...cp,
      url,
    })
  }

  const cp = ctx.auth.getCustomPageById(id)
  // trigger when receiving incoming call
  const c = ctx.call.calls.find(i => i.incoming && !i.answeredAt)
  const s = RnStacker.stacks[RnStacker.stacks.length - 1]
  // update title to tab label
  const onTitle = (t: string) => {
    if (!cp || !isCustomPageUrlBuilt(cp.url)) {
      return
    }
    ctx.auth.updateCustomPage({
      ...cp,
      title: t,
    })
  }

  // handle open custompage tab and reload page when received incoming
  if (
    (c || (!c && ctx.auth.saveActionOpenCustomPage)) &&
    s &&
    cp &&
    cp.incoming === 'open'
  ) {
    ctx.auth.saveActionOpenCustomPage = false
    if (s.name !== 'PageCustomPage') {
      // update stacker flow
      ctx.nav.customPageIndex = ctx.nav.goToPageCustomPage
      ctx.nav.goToPageCustomPage({
        id: cp.id,
      })
      ctx.auth.activeCustomPageId = cp.id
    }
    reloadPage(cp)
  }
  // update check loading page
  if (cp && cp.incoming === 'open' && !c) {
    delete ctx.auth.customPageLoadings[cp.id]
  }

  const isVisible =
    s &&
    cp &&
    s.isRoot &&
    s.name === 'PageCustomPage' &&
    RnStacker.stacks.length === 1 &&
    !ctx.call.inPageCallManage &&
    cp.id === ctx.auth.activeCustomPageId
  // onLoadEnd not fire with website load image from url camera
  // so, should be check loading like bellow
  const loaded = !jsLoading || !webviewLoading

  const title = cp?.title
    ? cp.title
    : !loaded
      ? intl`Loading...`
      : intl`PBX user settings`
  const description = !loaded
    ? intl`Loading...`
    : webviewError
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
          onPress: reloadPageWithNewToken,
        },
      ]}
      isFullContent
      className={
        isVisible
          ? 'web:h-screen native:h-full relative w-full overflow-hidden opacity-100'
          : 'absolute h-0 w-0 overflow-hidden opacity-0'
      }
    >
      {!!cp?.url && isCustomPageUrlBuilt(cp.url) && (
        <CustomPageWebView
          url={cp.url}
          onTitle={onTitle}
          onJsLoading={v => setJsLoading(v)}
          onLoadStart={() => setWebviewLoading(true)}
          onLoadEnd={e => {
            setWebviewLoading(false)
            setWebviewError(
              e &&
                'code' in e.nativeEvent &&
                typeof e.nativeEvent.code === 'number',
            )
          }}
          onError={() => setWebviewError(true)}
        />
      )}
    </Layout>
  )
})
