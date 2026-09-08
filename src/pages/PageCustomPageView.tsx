import { observer } from 'mobx-react'
import { Component } from 'react'
import { Platform, StyleSheet } from 'react-native'

import { isCustomPageUrlBuilt } from '#/api/customPage'
import { CustomPageWebView } from '#/components/CustomPageWebView'
import { Layout } from '#/components/Layout'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnStacker } from '#/stores/RnStacker'

const css = StyleSheet.create({
  invisible: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  visible: {
    position: 'relative',
    width: '100%',
    height: '100%',
    opacity: 1,
    overflow: 'hidden',
  },
})

const getVisibleStyle = () => {
  if (Platform.OS === 'web') {
    return [css.visible, { height: '100vh' } as any]
  }
  return css.visible
}

@observer
export class PageCustomPageView extends Component<{
  id: string
}> {
  state = {
    webviewLoading: false,
    webviewError: false,
    jsLoading: false,
  }
  reloadPageWithNewToken = async () => {
    await ctx.auth.reloadCustomPageWithNewToken(this.props.id)
  }

  render() {
    const {
      props: { id },
    } = this

    const cp = ctx.auth.getCustomPageById(id)
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    // update title to tab label
    const onTitle = (t: string) => {
      if (!cp || !isCustomPageUrlBuilt(cp.url)) {
        return
      }
      ctx.auth.updateCustomPage({ ...cp, title: t })
    }

    const isVisible =
      s &&
      cp &&
      s.isRoot &&
      s.name == 'PageCustomPage' &&
      RnStacker.stacks.length == 1 &&
      !ctx.call.inPageCallManage &&
      cp.id === ctx.auth.activeCustomPageId
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
        style={isVisible ? getVisibleStyle() : css.invisible}
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
