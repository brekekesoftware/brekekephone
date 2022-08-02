import { FC, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { BackBtn } from './HeaderBackBtn'
import { CreateBtn } from './HeaderCreateBtn'
import { Dropdown, DropdownBtn, HeaderDropdownItem } from './HeaderDropdown'
import { Navigation } from './HeaderNavigation'
import { Title } from './HeaderTitle'
import { v } from './variables'

const css = StyleSheet.create({
  Header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  Outer: {
    backgroundColor: v.bg,
  },
  Outer__compact: {
    ...v.boxShadow,
  },
  Outer__transparent: {
    backgroundColor: 'transparent',
  },
  Inner__hasBackBtn: {
    paddingLeft: 35,
  },
})

export const Header: FC<
  Partial<{
    compact: boolean
    description: string
    dropdown: HeaderDropdownItem[]
    menu: string
    onBack(): void
    onCreate(): void
    subMenu: string
    title: string
    transparent: boolean
    isTab?: boolean
  }>
> = p => {
  const {
    compact,
    description,
    dropdown,
    menu,
    onBack,
    onCreate,
    subMenu,
    title,
    isTab,
    transparent,
  } = p
  const [dropdownActive, setDropdownActive] = useState(false)
  return (
    <>
      <View style={css.Header}>
        <View
          style={[
            css.Outer,
            compact && css.Outer__compact,
            transparent && css.Outer__transparent,
          ]}
        >
          <View style={onBack && css.Inner__hasBackBtn}>
            <Title
              compact={compact as boolean}
              description={description}
              title={title as string}
            />
            {onBack && (
              <BackBtn compact={compact as boolean} onPress={onBack} />
            )}
            {dropdown && (
              <DropdownBtn onPress={() => setDropdownActive(true)} />
            )}
          </View>
          {menu && (
            <Navigation isTab={isTab} menu={menu} subMenu={subMenu as string} />
          )}
        </View>
      </View>
      {dropdown && dropdownActive && (
        <Dropdown
          close={() => setDropdownActive(false)}
          compact={compact as boolean}
          dropdown={dropdown}
        />
      )}
      {
        /* No compact mode, should only use in the noScroll layout (such as the account list page)
       Can not use together with dropdown */
        !dropdown && onCreate && (
          <CreateBtn onPress={onCreate} white={transparent as boolean} />
        )
      }
    </>
  )
}
