import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import {
  isCustomPageUrlBuilt,
  rebuildCustomPageUrl,
  rebuildCustomPageUrlNonce,
} from '../api/pbxCustomPage'
import { PbxCustomPage } from '../brekekejs'
import { CustomPageWebView } from '../components/CustomPageWebView'
import { Layout } from '../components/Layout'
import { RnText } from '../components/RnText'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { v } from '../components/variables'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnStacker } from '../stores/RnStacker'

const css = StyleSheet.create({
  BtnText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 80,
    position: 'absolute',
    top: 200,
    alignSelf: 'center',
    backgroundColor: v.colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    zIndex: 100,
  },
})

@observer
export class PageCustomPageView extends Component<{ id: string }> {
  state = {
    isError: false,
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
      state: { isError },
    } = this
    const as = getAuthStore()
    const cp = as.getCustomPageById(id)
    if (!cp) {
      return
    }
    const url = await rebuildCustomPageUrl(cp.url)
    as.updateCustomPage({ ...cp, url })
    if (isError) {
      this.setState({ isError: false })
    }
  }
  render() {
    const {
      props: { id },
      state: { isError },
    } = this
    const as = getAuthStore()
    const cp = as.getCustomPageById(id)
    // trigger when receiving incoming call
    const c = getCallStore().calls.find(i => i.incoming && !i.answeredAt)
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]
    // update title to tab label
    const onTitleChanged = (t: string) => {
      if (!cp || this.state.isError || !isCustomPageUrlBuilt(cp.url)) {
        return
      }
      as.updateCustomPage({ ...cp, title: t })
    }
    const onLoaded = () => {
      //
    }
    const onError = () => {
      if (cp && !isCustomPageUrlBuilt(cp.url)) {
        return
      }
      this.setState({ isError: true })
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
        return
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
          title={intl`Custom Page`}
          isFullContent
        >
          {isError && (
            <RnTouchableOpacity
              onPress={this.reloadPageWithNewToken}
              style={css.BtnText}
            >
              <RnText normal white bold>
                {intl`Reload`}
              </RnText>
            </RnTouchableOpacity>
          )}
          {!!cp?.url && isCustomPageUrlBuilt(cp.url) && (
            <CustomPageWebView
              url={cp.url}
              onTitleChanged={onTitleChanged}
              onLoadEnd={onLoaded}
              onError={onError}
            />
          )}
        </Layout>
      </View>
    )
  }
}
