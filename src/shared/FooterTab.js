import {
  mdiAccountCircleOutline,
  mdiMessageTextOutline,
  mdiNumeric,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import authStore from '../-/authStore';
import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Icon from './Icon';

const s = StyleSheet.create({
  FooterTab: {
    position: `absolute`,
    flex: 1,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: g.bg,
    borderTopWidth: 1 / 3,
    borderColor: `#cbcbcb`,
    ...g.boxShadow,
  },
  FooterTab__hasActions: {
    paddingHorizontal: 15,
  },
  FooterTab_Actions: {
    flexDirection: `row`,
    alignSelf: `stretch`,
    paddingBottom: 15,
  },
  FooterTab_Btn: {
    borderRadius: 0,
    width: `20%`,
    paddingTop: 8,
    alignItems: `center`,
  },
  FooterTab_Txt: {
    fontSize: 10,
  },
});

@observer
class FooterTab extends React.Component {
  render() {
    const chatsEnabled = authStore.profile?.ucEnabled;
    return (
      <View style={s.FooterTab}>
        <View style={s.FooterTab_Actions}>
          <TouchableOpacity
            onPress={g.goToUsersBrowse}
            style={[s.FooterTab_Btn]}
          >
            <Icon path={mdiAccountCircleOutline} />
            <Text style={[s.FooterTab_Txt]}>CONTACTS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={g.goToCallsRecent}
            style={[s.FooterTab_Btn]}
          >
            <Icon path={mdiPhoneOutline} />
            <Text style={[s.FooterTab_Txt]}>RECENTS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={g.goToCallsCreate}
            style={[s.FooterTab_Btn]}
          >
            <Icon path={mdiNumeric} />
            <Text style={[s.FooterTab_Txt]}>CALL</Text>
          </TouchableOpacity>
          {chatsEnabled && (
            <TouchableOpacity
              onPress={g.goToChatsRecent}
              style={[s.FooterTab_Btn]}
            >
              <Icon path={mdiMessageTextOutline} />
              <Text style={[s.FooterTab_Txt]}>CHAT</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={g.goToPageProfileCurrent}
            style={[s.FooterTab_Btn]}
          >
            <Icon path={mdiSettingsOutline} />
            <Text style={[s.FooterTab_Txt]}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default FooterTab;
