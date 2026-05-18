import type { FC } from 'react'
import { useState } from 'react'

import { View } from '@/rn/core/components/view'
import { BackBtn } from '#/components/header-back-btn'
import { CreateBtn } from '#/components/header-create-btn'
import type { HeaderDropdownItem } from '#/components/header-dropdown'
import { Dropdown, DropdownBtn } from '#/components/header-dropdown'
import { Navigation } from '#/components/header-navigation'
import { Title } from '#/components/header-title'
import { RnIcon } from '#/components/rn-icon'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'

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
      <View className='absolute top-0 right-0 left-0'>
        <View
          className={transparent ? 'bg-transparent' : 'bg-white'}
          style={compact ? v.boxShadow : undefined}
        >
          <View className={onBack ? 'pl-8.75' : undefined}>
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
                className='absolute top-0 bottom-0 flex-row items-center pr-1.25'
                style={{ right: dropdown ? 30 : 5 }}
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
