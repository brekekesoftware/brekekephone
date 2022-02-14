import { observer } from 'mobx-react'
import React, { FC, Fragment, useEffect, useRef } from 'react'
import {
  DefaultSectionT,
  Platform,
  SectionListData,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import {
  mdiMenuDown,
  mdiMenuLeft,
  mdiMoreHoriz,
  mdiPhone,
  mdiVideo,
} from '../assets/icons'
import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { ChatMessage, chatStore } from '../stores/chatStore'
import { Nav } from '../stores/Nav'
import {
  DropdownPosition,
  RnDropdownSectionList,
} from '../stores/RnDropdownSectionList'
import { userStore } from '../stores/userStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { filterTextOnly } from '../utils/formatChatContent'
import { UserItem } from './ContactUserItem'
import { Dropdown } from './Dropdown'
import { DropdownItemProps } from './DropdownItem'
import { RnIcon } from './RnIcon'
import { RnText } from './RnText'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const css = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  headerSectionList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: v.borderBg,
    paddingHorizontal: 5,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editGroupIcon: {
    marginRight: 10,
  },
  containerDropdown: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
})

type ContactSectionListProps = {
  sectionListData: SectionListData<UcBuddy, DefaultSectionT>[]
  isEditMode?: boolean
  ddItems?: DropdownItemProps[]
}
export const ContactSectionList: FC<ViewProps & ContactSectionListProps> =
  observer(p => {
    const sectionHeaderRefs = useRef<View[]>([])
    const reCalculatedLayoutDropdownTimeoutId = useRef<number>(0)

    useEffect(() => {
      RnDropdownSectionList.setIsShouldUpdateDropdownPosition(true)
    }, [])

    useEffect(() => {
      if (
        p.isEditMode &&
        RnDropdownSectionList.isShouldUpdateDropdownPosition
      ) {
        // recalculate position header dropdown
        RnDropdownSectionList.setIsShouldUpdateDropdownPosition(false)
        calculateSectionHeaderPosition()
      }
      // eslint-disable-next-line react-app/react-hooks/exhaustive-deps
    }, [p.isEditMode, RnDropdownSectionList.isShouldUpdateDropdownPosition])

    const clearConnectTimeoutId = () => {
      if (reCalculatedLayoutDropdownTimeoutId) {
        BackgroundTimer.clearTimeout(
          reCalculatedLayoutDropdownTimeoutId.current,
        )
        reCalculatedLayoutDropdownTimeoutId.current = 0
      }
    }

    const calculateSectionHeaderPosition = () => {
      if (reCalculatedLayoutDropdownTimeoutId) {
        clearConnectTimeoutId()
      }

      reCalculatedLayoutDropdownTimeoutId.current = BackgroundTimer.setTimeout(
        () => {
          // Must wrap in setTimeout to make sure
          // the header view has completed render
          const listDropdownPosition: DropdownPosition[] = []
          sectionHeaderRefs.current.forEach((ref: View, index) => {
            if (ref) {
              ref.measure((fx, fy, w, h, px, py) => {
                listDropdownPosition.push({
                  top: Platform.OS === 'ios' ? py : py + h,
                  right: 20,
                })

                // after get all section list dropdown position
                if (index === sectionHeaderRefs.current.length - 1) {
                  RnDropdownSectionList.setDropdownPosition(
                    listDropdownPosition,
                  )
                  RnDropdownSectionList.setHeaderHeight(h)
                }
              })
            }
          })
        },
        300,
      )
    }

    const renderHeaderSection = (
      title: string,
      data: readonly UcBuddy[],
      index: number,
    ) => {
      const selectedItemCount = userStore.isSelectedAddAllUser
        ? data.length
        : data.filter(item =>
            userStore.selectedUserIds.some(itm => itm === item.user_id),
          ).length
      const isHidden = RnDropdownSectionList.hiddenGroupIndex.some(
        idx => idx === index,
      )

      return (
        <RnTouchableOpacity
          onPress={() =>
            RnDropdownSectionList.toggleSection(index, data.length)
          }
        >
          <View
            style={css.headerSectionList}
            ref={c => {
              if (c && p.isEditMode) {
                sectionHeaderRefs.current[index] = c
              }
            }}
          >
            <Fragment>
              <View style={css.leftSection}>
                <View>
                  <RnIcon path={isHidden ? mdiMenuLeft : mdiMenuDown} />
                </View>
                <RnText small>{`${title} ${
                  p.isEditMode
                    ? selectedItemCount
                    : data.filter(itm => itm.status === 'online').length
                }/${data.length}`}</RnText>
              </View>
              {p.isEditMode && (
                <RnTouchableOpacity
                  style={css.editGroupIcon}
                  onPress={() => {
                    if (
                      RnDropdownSectionList.hiddenGroupIndex.some(
                        idx => idx === index,
                      )
                    ) {
                      RnDropdownSectionList.toggleSection(index, data.length)
                    }
                    RnDropdownSectionList.setDropdown(index)
                  }}
                >
                  <RnIcon path={mdiMoreHoriz} />
                </RnTouchableOpacity>
              )}
            </Fragment>
          </View>
        </RnTouchableOpacity>
      )
    }

    const getLastMessageChat = (id: string) => {
      const chats = filterTextOnly(chatStore.messagesByThreadId[id])
      return chats.length !== 0 ? chats[chats.length - 1] : ({} as ChatMessage)
    }

    const renderItemUser = (item: UcBuddy, index: number) => {
      const isHidden = RnDropdownSectionList.hiddenGroupIndex.some(
        idx => idx === index,
      )
      return !isHidden ? (
        <View
          key={`ItemUser-${item.user_id}-${index}`}
          onLayout={e => {
            RnDropdownSectionList.setItemHeight(e.nativeEvent.layout.height)
          }}
        >
          {p.isEditMode ? (
            <RnTouchableOpacity
              onPress={() => userStore.selectUserId(item.user_id)}
              disabled={userStore.isSelectedAddAllUser}
            >
              <UserItem
                id={item.user_id}
                name={item.name || item.user_id}
                avatar={item.profile_image_url}
                disabled={userStore.isSelectedAddAllUser}
                isSelected={
                  userStore.isSelectedAddAllUser ||
                  userStore.selectedUserIds.some(itm => itm === item.user_id)
                }
                onSelect={() => userStore.selectUserId(item.user_id)}
                isSelection
              />
            </RnTouchableOpacity>
          ) : (
            <RnTouchableOpacity
              onPress={
                getAuthStore().currentProfile.ucEnabled
                  ? () => Nav().goToPageChatDetail({ buddy: item.user_id })
                  : undefined
              }
            >
              <UserItem
                iconFuncs={[
                  () => callStore.startVideoCall(item.user_id),
                  () => callStore.startCall(item.user_id),
                ]}
                icons={[mdiVideo, mdiPhone]}
                lastMessage={getLastMessageChat(item.user_id)?.text}
                id={item.user_id}
                name={item.name}
                avatar={item.profile_image_url}
                status={item.status}
              />
            </RnTouchableOpacity>
          )}
        </View>
      ) : null
    }

    const { dropdownOpenedIndex, listDropdownPosition } = RnDropdownSectionList

    return (
      <Fragment>
        {p.sectionListData.map((item, index) => (
          <Fragment key={`ContactSectionListDataItem-${item.title}-${index}`}>
            {renderHeaderSection(item.title, item.data, index)}
            {item.data.map(itemUser => renderItemUser(itemUser, index))}
          </Fragment>
        ))}
        {dropdownOpenedIndex >= 0 && (
          <TouchableWithoutFeedback
            onPress={() => RnDropdownSectionList.closeDropdown()}
          >
            <View style={css.containerDropdown}>
              <Dropdown
                position={listDropdownPosition[dropdownOpenedIndex]}
                items={p.ddItems}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
      </Fragment>
    )
  })
