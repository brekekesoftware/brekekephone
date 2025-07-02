import type { FC } from 'react'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { BackBtn } from '#/components/HeaderBackBtn'
import { CreateBtn } from '#/components/HeaderCreateBtn'
import type { HeaderDropdownItem } from '#/components/HeaderDropdown'
import { Dropdown, DropdownBtn } from '#/components/HeaderDropdown'
import { Navigation } from '#/components/HeaderNavigation'
import { Title } from '#/components/HeaderTitle'
import { RnIcon } from '#/components/RnIcon'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'

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
  ButtonIcon__right: {
    position: 'absolute',
    top: 0,
    right: 30,
    flexDirection: 'row',
    bottom: 0,
    alignItems: 'center',
    paddingRight: 5,
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
    iconRights?: string[]
    iconRightColors?: string[]
    iconRightFuncs?: Function[]
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
    iconRights,
    iconRightColors,
    iconRightFuncs,
  } = p
  const [dropdownActive, setDropdownActive] = useState(false)
  const onPressRightIcons = (i: number) => {
    if (iconRights && iconRights[i]) {
      iconRightFuncs?.[i]?.()
    }
  }
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
            {iconRights && iconRights.length > 0 && (
              <View
                style={[css.ButtonIcon__right, { right: dropdown ? 30 : 5 }]}
              >
                {iconRights?.map((_, i) => (
                  <RnTouchableOpacity
                    key={i}
                    onPress={e => onPressRightIcons(i)}
                  >
                    <RnIcon path={_} color={iconRightColors?.[i]} />
                  </RnTouchableOpacity>
                ))}
              </View>
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
