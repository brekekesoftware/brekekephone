import { observer } from 'mobx-react'
import { Component } from 'react'

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

@observer
export class PageCustomPage extends Component<{
  key: string
}> {
  render() {
    // const customPage = getAuthStore().listCustomPage.find(cp => cp.id === this.props.subMenu.key)

    console.log('thangnt::PageCustomPage::', { subMenu: this.props.key })
    return (
      <Layout
        description={intl`Custom Page`}
        menu={'settings'}
        subMenu={this.props.key}
        title={this.props.key}
      >
        <Field isGroup label={intl`WEBCHAT THREADS`} />
      </Layout>
    )
  }
}
