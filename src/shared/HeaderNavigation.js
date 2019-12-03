import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';

const s = StyleSheet.create({
  HeaderNavigation: {
    flexDirection: `row`,
    alignSelf: `stretch`,
    ...g.boxShadow,
  },

  HeaderNavigation_Menu__sub: {
    backgroundColor: g.bg,
    paddingHorizontal: 15,
  },
  HeaderNavigation_Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: `center`,
  },
  HeaderNavigation_Btn__active: {
    backgroundColor: g.bg,
  },
  HeaderNavigation_BtnText__active: {
    color: g.mainDarkBg,
  },
});

const HeaderNavigation = ({ menu, subMenu }) => {
  const isMenuContact = menu === `contact`;
  const isMenuPhone = menu === `phone`;
  const isMenuSettings = menu === `settings`;

  let subMenuButtons = null;
  if (isMenuContact) {
    subMenuButtons = (
      <React.Fragment>
        <TouchableOpacity
          onPress={g.goToPageContactPhonebook}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={
              subMenu === `phonebook` && s.HeaderNavigation_BtnText__active
            }
          >
            PHONEBOOK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToPageContactUsers}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `users` && s.HeaderNavigation_BtnText__active}
          >
            USERS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToPageChatRecents}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `chat` && s.HeaderNavigation_BtnText__active}
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
          onPress={g.goToPageCallKeypad}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `keypad` && s.HeaderNavigation_BtnText__active}
          >
            KEYPAD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToPageCallRecents}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `recents` && s.HeaderNavigation_BtnText__active}
          >
            RECENTS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToPageCallParks}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `parks` && s.HeaderNavigation_BtnText__active}
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
          onPress={g.goToPageSettingsProfile}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `profile` && s.HeaderNavigation_BtnText__active}
          >
            PROFILE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={g.goToPageSettingsOther}
          style={s.HeaderNavigation_Btn}
        >
          <Text
            small
            style={subMenu === `settings` && s.HeaderNavigation_BtnText__active}
          >
            SETTINGS
          </Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  }
  return (
    <View style={[s.HeaderNavigation, s.HeaderNavigation_Menu__sub]}>
      {subMenuButtons}
    </View>
  );
};

export default HeaderNavigation;
