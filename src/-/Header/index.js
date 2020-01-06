import React, { useState } from 'react';

import g from '../../global';
import { StyleSheet, View } from '../Rn';
import BackBtn from './BackBtn';
import CreateBtn from './CreateBtn';
import Dropdown from './Dropdown';
import Navigation from './Navigation';
import Title from './Title';

const css = StyleSheet.create({
  Header: {
    position: `absolute`,
    top: 0,
    left: 0,
    right: 0,
  },
  Outer: {
    backgroundColor: g.bg,
  },
  Outer__compact: {
    ...g.boxShadow,
  },
  Outer__transparent: {
    backgroundColor: `transparent`,
  },
  Inner__hasBackBtn: {
    paddingLeft: 35,
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
  return (
    <React.Fragment>
      <View style={[css.Header]}>
        <View
          style={[
            css.Outer,
            compact && css.Outer__compact,
            transparent && css.Outer__transparent,
          ]}
        >
          <View style={onBack && css.Inner__hasBackBtn}>
            <Title compact={compact} description={description} title={title} />
            {onBack && <BackBtn compact={compact} onPress={onBack} />}
            {dropdown && (
              <Dropdown.Btn onPress={() => setDropdownActive(true)} />
            )}
          </View>
          {menu && <Navigation menu={menu} subMenu={subMenu} />}
        </View>
      </View>
      {dropdown && dropdownActive && (
        <Dropdown
          close={() => setDropdownActive(false)}
          compact={compact}
          dropdown={dropdown}
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
