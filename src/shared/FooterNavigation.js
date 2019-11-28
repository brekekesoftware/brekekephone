import {
  mdiAccountCircleOutline,
  mdiPhoneOutline,
  mdiSettingsOutline,
} from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
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
  FooterNavigation_BtnText__active: {
    color: g.mainDarkBg,
  },
});

const FooterNavigation = ({ menu, subMenu }) => {
  const isMenuContact = menu === `contact`;
  const isMenuPhone = menu === `phone`;
  const isMenuSettings = menu === `settings`;

  let subMenuButtons = null;
  if (isMenuContact) {
    subMenuButtons = (
      <React.Fragment>
        <TouchableOpacity
          onPress={g.goToContactsBrowse}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={
              subMenu === `phonebook` && s.FooterNavigation_BtnText__active
            }
          >
            PHONEBOOK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToPageContactUsers}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `users` && s.FooterNavigation_BtnText__active}
          >
            USERS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToChatsRecent}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `chat` && s.FooterNavigation_BtnText__active}
          >
            CHAT
          </Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  } else if (isMenuPhone) {
    subMenuButtons = (
      <React.Fragment>
        <TouchableOpacity
          onPress={g.goToCallKeypad}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `callpad` && s.FooterNavigation_BtnText__active}
          >
            CALLPAD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToCallsRecent}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `recents` && s.FooterNavigation_BtnText__active}
          >
            RECENTS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToCallPark}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `parks` && s.FooterNavigation_BtnText__active}
          >
            PARKS
          </Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  } else if (isMenuSettings) {
    subMenuButtons = (
      <React.Fragment>
        <TouchableOpacity
          onPress={g.goToPageProfileCurrent}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `profile` && s.FooterNavigation_BtnText__active}
          >
            PROFILE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToSetting}
          style={s.FooterNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `settings` && s.FooterNavigation_BtnText__active}
          >
            SETTINGS
          </Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  }
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
          onPress={isMenuPhone ? null : g.goToCallsRecent}
          style={[
            s.FooterNavigation_Btn,
            isMenuPhone && s.FooterNavigation_Btn__active,
          ]}
        >
          <Icon path={mdiPhoneOutline} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isMenuSettings ? null : g.goToPageProfileCurrent}
          style={[
            s.FooterNavigation_Btn,
            isMenuSettings && s.FooterNavigation_Btn__active,
          ]}
        >
          <Icon path={mdiSettingsOutline} />
        </TouchableOpacity>
      </View>
      <View style={[s.FooterNavigation_Menu, s.FooterNavigation_Menu__sub]}>
        {subMenuButtons}
      </View>
    </View>
  );
};

export default FooterNavigation;
