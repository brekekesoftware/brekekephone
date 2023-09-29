import { observer } from 'mobx-react'
import { Component } from 'react'
import { StyleSheet } from 'react-native'
import WebView from 'react-native-webview'

import { PbxCustomPage } from '../brekekejs'
import { ListWebchats } from '../components/ChatListWebchats'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { SubMenu } from '../components/navigationConfig'
import { RnText } from '../components/Rn'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { chatStore } from '../stores/chatStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

const css = StyleSheet.create({
  image: {
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  imageError: {
    overflow: 'hidden',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00000030',
    overflow: 'hidden',
    zIndex: 100,
  },
  full: {
    width: '100%',
    height: '100%',
  },
})
@observer
export class PageCustomPage extends Component<{ id: string }> {
  render() {
    const { id } = this.props
    const customPage = getAuthStore().listCustomPage.find(cp => cp.id === id)
    console.error('thangnt::PageCustomPage::', { subMenu: this.props })
    return (
      <Layout
        description={customPage?.title}
        menu={'settings'}
        subMenu={id}
        title={intl`Custom Page`}
      >
        {customPage && (
          <WebView
            source={{
              uri: customPage?.url,
            }}
            // injectedJavaScript={configViewPort}
            style={[css.full]}
            bounces={false}
            startInLoadingState={true}
            onMessage={() => {}}
            onLoadEnd={() => {}}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            scalesPageToFit={false}
          />
        )}
      </Layout>
    )
  }
}
