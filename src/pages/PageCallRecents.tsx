import { mdiMagnify, mdiPhone, mdiVideo } from '@mdi/js'
import PushNotificationIOS, {
  PushNotification as PN,
} from '@react-native-community/push-notification-ios'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { Component } from 'react'
import { Button, Platform, View } from 'react-native'
// import Torch from 'react-native-torch'
import { NativeModules } from 'react-native'
import FCM from 'react-native-fcm'

import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { getAuthStore } from '../stores/authStore'
import { AuthStore } from '../stores/authStore2'
import { callStore } from '../stores/callStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { BrekekeUtils } from '../utils/RnNativeModules'

const { BrekekeModule } = NativeModules

@observer
export class PageCallRecents extends Component {
  isMatchUser = (call: AuthStore['currentData']['recentCalls'][0]) => {
    if (call.partyNumber.includes(contactStore.callSearchRecents)) {
      return call.id
    }
    return ''
  }

  getAvatar = (id: string) => {
    const ucUser = contactStore.getUcUserById(id) || {}
    return {
      id,
      avatar: ucUser.avatar,
    }
  }
  getMatchedCalls = () => {
    const calls = getAuthStore().currentData.recentCalls.filter(
      this.isMatchUser,
    )
    // Backward compatibility to remove invalid items from the previous versions
    const filteredCalls = calls.filter(
      c =>
        typeof c.created === 'string' &&
        // HH:mm - MMM D
        ((c.created + '').length === 13 || (c.created + '').length === 14),
    )
    const today = moment().format('MMM D')
    return filteredCalls.map(c => ({
      ...c,
      created: (c.created + '').replace(` - ${today}`, ''),
    }))
  }

  render() {
    const calls = this.getMatchedCalls()
    const switchState =
      Platform.OS === 'android'
        ? BrekekeUtils.switchState
        : BrekekeModule.switchState
    return (
      <Layout
        description={intl`Recent voicemails and calls`}
        menu='call'
        subMenu='recents'
        title={intl`Recents`}
      >
        <View
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 200,
          }}
        >
          <Button
            title='on'
            onPress={() => {
              switchState(true)
            }}
          />
          <Button
            title='off'
            onPress={() => {
              switchState(false)
            }}
          />
        </View>
        <Field
          icon={mdiMagnify}
          label={intl`SEARCH NAME, PHONE NUMBER ...`}
          onValueChange={(v: string) => {
            contactStore.callSearchRecents = v
          }}
          value={contactStore.callSearchRecents}
        />
        <Field
          isGroup
          label={intl`VOICEMAILS (${callStore.newVoicemailCount})`}
        />
        <UserItem
          iconFuncs={[
            () => {
              Platform.OS === 'android' &&
                FCM.presentLocalNotification({
                  body: '',
                  title: '',
                  badge: 10,
                  number: 12,
                  priority: 'high',
                  show_in_foreground: false,
                  local_notification: true,
                  wake_screen: true,
                  ongoing: false,
                  lights: true,
                  channel: 'default',
                  icon: 'ic_launcher',
                  my_custom_data: 'local_notification',
                  is_local_notification: 'local_notification',
                  content_available: true,
                })
              Platform.OS === 'ios' &&
                PushNotificationIOS.setApplicationIconBadgeNumber(10)
              // callStore.startCall('8')
            },
          ]}
          icons={[mdiPhone]}
          name={'Voicemails'}
          isVoicemail
        />
        <Field isGroup label={intl`RECENT CALLS (${calls.length})`} />
        {calls.map((c, i) => (
          <UserItem
            iconFuncs={[
              () => callStore.startVideoCall(c.partyNumber),
              () => callStore.startCall(c.partyNumber),
            ]}
            {...contactStore.getUcUserById(c.partyNumber)}
            icons={[mdiVideo, mdiPhone]}
            isRecentCall
            canChat={getAuthStore().currentProfile.ucEnabled}
            key={i}
            {...this.getAvatar(c.partyNumber)}
            {...c}
          />
        ))}
      </Layout>
    )
  }
}
