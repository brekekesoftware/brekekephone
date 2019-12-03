import {
  mdiAccountCircleOutline,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, TouchableOpacity, View } from '../native/Rn';
import Icon from './Icon';

const s = StyleSheet.create({
  FooterNavigation: {
    position: `absolute`,
    flex: 1,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: g.hoverBg,
    paddingHorizontal: 15,
    ...g.boxShadow,
  },
  FooterNavigation_Menu: {
    flexDirection: `row`,
    alignSelf: `stretch`,
  },
  FooterNavigation_Menu__sub: {
    position: `absolute`,
    bottom: `100%`,
    left: 0,
    right: 0,
    backgroundColor: g.bg,
    paddingHorizontal: 15,
  },
  FooterNavigation_Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: `center`,
  },
  FooterNavigation_Btn__active: {
    backgroundColor: g.bg,
  },
});

const FooterNavigation = ({ menu }) => {
  const isMenuContact = menu === `contact`;
  const isMenuPhone = menu === `phone`;
  const isMenuSettings = menu === `settings`;

  return (
    <View style={s.FooterNavigation}>
      <View style={s.FooterNavigation_Menu}>
        <TouchableOpacity
          onPress={isMenuContact ? null : g.goToPageContactUsers}
          style={[
            s.FooterNavigation_Btn,
            isMenuContact && s.FooterNavigation_Btn__active,
          ]}
        >
          <Icon path={mdiAccountCircleOutline} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isMenuPhone ? null : g.goToPageCallRecents}
          style={[
            s.FooterNavigation_Btn,
            isMenuPhone && s.FooterNavigation_Btn__active,
          ]}
        >
          <Icon path={mdiPhoneOutline} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isMenuSettings ? null : g.goToPageSettingsProfile}
          style={[
            s.FooterNavigation_Btn,
            isMenuSettings && s.FooterNavigation_Btn__active,
          ]}
        >
          <Icon path={mdiSettingsOutline} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FooterNavigation;
