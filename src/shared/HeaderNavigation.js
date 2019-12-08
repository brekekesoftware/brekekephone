import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';

const s = StyleSheet.create({
  HeaderNavigation: {
    flexDirection: `row`,
    alignSelf: `stretch`,
  },
  HeaderNavigation_Menu__sub: {
    backgroundColor: g.bg,
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
  HeaderNavigation_SubBtn: {
    borderBottomWidth: 3,
    borderColor: g.borderBg,
  },
  HeaderNavigation_SubBtn__active: {
    borderColor: g.mainDarkBg,
  },
});

const SubMenuButton = ({ active, onPress, text }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      s.HeaderNavigation_Btn,
      s.HeaderNavigation_SubBtn,
      active && s.HeaderNavigation_SubBtn__active,
    ]}
  >
    <Text small style={active && s.HeaderNavigation_BtnText__active}>
      {text}
    </Text>
  </TouchableOpacity>
);

const HeaderNavigation = ({ menu, subMenu }) => {
  const isMenuContact = menu === `contact`;
  const isMenuPhone = menu === `phone`;
  const isMenuSettings = menu === `settings`;

  let subMenuButtons = null;
  if (isMenuContact) {
    subMenuButtons = (
      <React.Fragment>
        <SubMenuButton
          active={subMenu === `phonebook`}
          onPress={g.goToPageContactPhonebook}
          text={`PHONEBOOK`}
        />
        <SubMenuButton
          active={subMenu === `users`}
          onPress={g.goToPageContactUsers}
          text={`USERS`}
        />
        <SubMenuButton
          active={subMenu === `chat`}
          onPress={g.goToPageChatRecents}
          text={`CHAT`}
        />
      </React.Fragment>
    );
  } else if (isMenuPhone) {
    subMenuButtons = (
      <React.Fragment>
        <SubMenuButton
          active={subMenu === `keypad`}
          onPress={g.goToPageCallKeypad}
          text={`KEYPAD`}
        />
        <SubMenuButton
          active={subMenu === `recents`}
          onPress={g.goToPageCallRecents}
          text={`RECENTS`}
        />
        <SubMenuButton
          active={subMenu === `parks`}
          onPress={g.goToPageCallParks}
          text={`PARKS`}
        />
      </React.Fragment>
    );
  } else if (isMenuSettings) {
    subMenuButtons = (
      <React.Fragment>
        <SubMenuButton
          active={subMenu === `profile`}
          onPress={g.goToPageSettingsProfile}
          text={`CURRENT SERVER`}
        />
        <SubMenuButton
          active={subMenu === `settings`}
          onPress={g.goToPageSettingsOther}
          text={`OTHER SETTINGS`}
        />
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
