import React, { useState } from 'react';

import g from '../global';
import { Animated, StyleSheet, View } from '../native/Rn';
import { useAnimation } from '../utils/animation';
import BackBtn from './BackBtn';
import CreateBtn from './CreateBtn';
import Dropdown from './Dropdown';
import HeaderNavigation from './HeaderNavigation';
import Title from './Title';

const css = StyleSheet.create({
  Header: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
  },
  Inner: {
    padding: 15,
    backgroundColor: g.bg,
  },
  Inner__compact: {
    ...g.boxShadow,
  },
  Inner__hasBackBtn: {
    paddingLeft: 50,
  },
  Inner__transparent: {
    backgroundColor: `transparent`,
  },
});

const Header = ({
  compact,
  description,
  dropdown,
  menu,
  onBack,
  onCreate,
  subMenu,
  title,
  transparent,
}) => {
  const [dropdownActive, setDropdownActive] = useState(false);
  const cssInnerA = useAnimation(compact, {
    paddingVertical: [15, 10],
  });
  return (
    <React.Fragment>
      <View style={[css.Header]}>
        <Animated.View
          style={[
            css.Inner,
            compact && css.Inner__compact,
            onBack && css.Inner__hasBackBtn,
            transparent && css.Inner__transparent,
            cssInnerA,
          ]}
        >
          <Title compact={compact} description={description} title={title} />
          {onBack && <BackBtn compact={compact} onPress={onBack} />}
          {dropdown && <Dropdown.Btn onPress={() => setDropdownActive(true)} />}
        </Animated.View>
        {menu && <HeaderNavigation menu={menu} subMenu={subMenu} />}
      </View>
      {dropdown && (
        <Dropdown
          active={dropdownActive}
          close={() => setDropdownActive(false)}
          compact={compact}
          items={dropdown}
        />
      )}
      {/* No compact mode, should only use in the noScroll layout (such as the server list page)
       Can not use together with dropdown */
      !dropdown && onCreate && (
        <CreateBtn onPress={onCreate} white={transparent} />
      )}
    </React.Fragment>
  );
};

export default Header;
