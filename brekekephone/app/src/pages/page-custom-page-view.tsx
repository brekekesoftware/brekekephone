import { observer } from 'mobx-react'
import { useState } from 'react'

import { isCustomPageUrlBuilt } from '@/api/custom-page'
import { CustomPageWebView } from '@/components/custom-page-web-view'
import { Layout } from '@/components/layout'
import { ctx } from '@/stores/ctx'
import { intl } from '@/stores/intl'
import { RnStacker } from '@/stores/rn-stacker'

export const PageCustomPageView = observer(({ id }: { id: string }) => {
  const [webviewLoading, setWebviewLoading] = useState(false)
  const [webviewError, setWebviewError] = useState(false)
  const [jsLoading, setJsLoading] = useState(false)

  const reloadPageWithNewToken = async () => {
    await ctx.auth.reloadCustomPageWithNewToken(id)
  }

  const cp = ctx.auth.getCustomPageById(id)
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
