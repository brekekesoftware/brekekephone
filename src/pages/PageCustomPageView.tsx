import { random } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import { pbx } from '../api/pbx'
import { PbxCustomPage } from '../brekekejs'
import { CustomPageWebView } from '../components/CustomPageWebView'
import { Layout } from '../components/Layout'
import { RnText } from '../components/RnText'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { v } from '../components/variables'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
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
  getUrlParams = async (url: string) => {
    const token = await pbx.getPbxToken()
    const user = getAuthStore().getCurrentAccount()
    return url
      .replace(/#lang#/i, intlStore.locale)
      .replace(/#pbx-token#/i, token.token)
      .replace(/#tenant#'/i, user.pbxTenant)
      .replace(/#user#/i, user.pbxUsername)
      .replace(/#from-number#/i, '0')
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
    const tokenNotExist = /#pbx-token#/i.test(cp.url)
    if (tokenNotExist) {
      return
    }
    getAuthStore().reLoadCustomPageById(cp.id)
  }
  reloadPageWithNewToken = async () => {
    const { id } = this.props
    const { isError } = this.state
    const cp = getAuthStore().getCustomPageById(id)
    if (!cp) {
      return
    }
    const url = await this.getURLToken(cp.url)
    getAuthStore().updateCustomPage({ ...cp, url })
    if (isError) {
      this.setState({ isError: false })
    }
  }
  render() {
    const { id } = this.props
    const { isError } = this.state
    const au = getAuthStore()
    const cp = au.getCustomPageById(id)
    // Trigger get received incoming call
    const c = getCallStore().calls.find(i => i.incoming && !i.answeredAt)
    const s = RnStacker.stacks[RnStacker.stacks.length - 1]

    const onTitleChanged = (t: string) => {
      // Update title to tab label
      if (!cp || this.state.isError || /#pbx-token#/i.test(cp.url)) {
        return
      }
      au.updateCustomPage({ ...cp, title: t })
    }

    const onLoaded = () => {}

    const onError = () => {
      if (cp && /#pbx-token#/i.test(cp.url)) {
        return
      }
      this.setState({ isError: true })
    }

    // handle open custompage tab and reload page when received incoming
    if (
      (c || (!c && au.saveActionOpenCustomPage)) &&
      s &&
      cp &&
      cp.incoming === 'open'
    ) {
      au.saveActionOpenCustomPage = false
      if (s.name != 'PageCustomPage') {
        // update stacker flow
        Nav().customPageIndex = Nav().goToPageCustomPage
        Nav().goToPageCustomPage({ id: cp.id })
        return
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
          {cp && !/#pbx-token#/i.test(cp.url) && (
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
