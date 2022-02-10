import { observer } from 'mobx-react'
import React, { FC, Fragment, useEffect, useRef } from 'react'
import {
  DefaultSectionT,
  SectionListData,
  StyleSheet,
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
import { SelectionItem } from './SelectionItem'
import { v } from './variables'

const css = StyleSheet.create({
  headerSectionList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'gray',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: '#333',
  },
  rightSection: {
    flexDirection: 'row',
  },
  itemEditWrapper: {
    borderBottomColor: v.borderBg,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  itemWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 10,
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
      if (
        p.isEditMode &&
        RnDropdownSectionList.isShouldUpdateDropdownPosition
      ) {
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
          const listDropdownYPosition: DropdownPosition[] = []
          sectionHeaderRefs.current.forEach((ref: View, index) => {
            if (ref) {
              ref.measure((fx, fy, w, h, px, py) => {
                listDropdownYPosition.push({ top: py + h, right: 20 })

                // after get all section list dropdown position
                if (index === sectionHeaderRefs.current.length - 1) {
                  RnDropdownSectionList.setDropdownPosition(
                    listDropdownYPosition,
                  )
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
      const onlineUserCount = 0
      const selectedItemCount = userStore.isSelectedAddAllUser
        ? data.length
        : data.filter(item =>
            userStore.selectedUserIds.some(itm => itm === item.user_id),
          ).length
      const isHidden = RnDropdownSectionList.hiddenGroupIndex.some(
        idx => idx === index,
      )

      return (
        <View
          style={css.headerSectionList}
          ref={c => {
            if (c && p.isEditMode) {
              sectionHeaderRefs.current[index] = c
            }
          }}
        >
          <RnText style={css.headerTitle}>{`${title} ${
            p.isEditMode ? selectedItemCount : onlineUserCount
          }/${data.length}`}</RnText>
          <View style={css.rightSection}>
            {p.isEditMode && (
              <RnTouchableOpacity
                onPress={() => RnDropdownSectionList.setDropdown(index)}
              >
                <RnIcon path={mdiMoreHoriz} />
              </RnTouchableOpacity>
            )}
            <RnTouchableOpacity
              onPress={() => RnDropdownSectionList.toggleSection(index)}
            >
              <RnIcon path={isHidden ? mdiMenuLeft : mdiMenuDown} />
            </RnTouchableOpacity>
          </View>
        </View>
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
        <View style={p.isEditMode ? css.itemEditWrapper : css.itemWrapper}>
          {p.isEditMode ? (
            <SelectionItem
              isSelected={
                userStore.isSelectedAddAllUser ||
                userStore.selectedUserIds.some(itm => itm === item.user_id)
              }
              onPress={() => userStore.selectUserId(item.user_id)}
              title={item.name || item.user_id}
              disabled={userStore.isSelectedAddAllUser}
            />
          ) : (
            <RnTouchableOpacity
              key={`${item.user_id} ${index}`}
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
      ) : (
        <View />
      )
    }

    const { listDropdownYPosition, dropdownOpenedIndex } = RnDropdownSectionList

    return (
      <Fragment>
        {p.sectionListData.map((item, index) => (
          <Fragment>
            {renderHeaderSection(item.title, item.data, index)}
            {item.data.map(itemUser => renderItemUser(itemUser, index))}
          </Fragment>
        ))}
        {dropdownOpenedIndex >= 0 && (
          <Dropdown
            position={listDropdownYPosition[dropdownOpenedIndex]}
            items={p.ddItems}
          />
        )}
      </Fragment>
    )
  })