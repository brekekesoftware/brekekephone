import stableStringify from 'json-stable-stringify'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'
import { observer } from 'mobx-react'
import React from 'react'
import { Group, StyleSheet, View } from 'react-native'

import { UcMessageLog } from '../api/brekekejs'
import uc from '../api/uc'
import ListUsers from '../components/ChatListUsers'
import ListWebchats from '../components/ChatListWebchats'
import Field from '../components/Field'
import Layout from '../components/Layout'
import { RnText } from '../components/Rn'
import { getAuthStore } from '../stores/authStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'
import webchatStore from '../stores/webchatStore'
import { filterTextOnly, formatChatContent } from '../utils/formatChatContent'
import { arrToMap } from '../utils/toMap'

@observer
class PageWebChat extends React.Component {
  render() {
    const arr = webchatStore?.webchats || []

    return (
      <Layout
        description={intl`UC recent active chat`}
        dropdown={[
          {
            label: intl`Create group chat`,
            onPress: Nav().goToPageChatGroupCreate,
          },
        ]}
        menu='contact'
        subMenu='webchat'
        title={intl`WebChat`}
      >
        <Field isGroup label={intl`WEBCHAT THREADS`} />
        {!arr.length && (
          <RnText center normal small warning style={{ marginTop: 5 }}>
            {intl`There's no active chat thread`}
          </RnText>
        )}
        <ListWebchats datas={arr} />
      </Layout>
    )
  }
}
const LabelHeader = () => {
  return <View style={css.container}></View>
}

const css = StyleSheet.create({
  container: {
    flex: 1,
  },
})
export default PageWebChat
