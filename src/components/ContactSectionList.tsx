import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC, Fragment, useEffect, useRef } from 'react'
import {
  DefaultSectionT,
  Platform,
  SectionList,
  SectionListData,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewProps,
} from 'react-native'

import { UcBuddy } from '../api/brekekejs'
import {
  mdiMenuDown,
  mdiMenuRight,
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
    paddingVertical: 12,
    marginTop: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editGroupIcon: {
    paddingHorizontal: 10,
  },
  containerDropdown: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  disableMarginTop: { marginTop: 0 },
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
      if (reCalculatedLayoutDropdownTimeoutId.current) {
        BackgroundTimer.clearTimeout(
          reCalculatedLayoutDropdownTimeoutId.current,
        )
        reCalculatedLayoutDropdownTimeoutId.current = 0
      }
    }

    const calculateSectionHeaderPosition = () => {
      if (reCalculatedLayoutDropdownTimeoutId.current) {
        clearConnectTimeoutId()
      }

      // Must wrap in setTimeout to make sure the header view has completed render
      reCalculatedLayoutDropdownTimeoutId.current = BackgroundTimer.setTimeout(
        () => {
          reCalculatedLayoutDropdownTimeoutId.current = 0
          const listDropdownPosition: DropdownPosition[] = []
          sectionHeaderRefs.current.forEach((ref: View, index) => {
            if (ref) {
              ref.measure((fx, fy, w, h, px, py) => {
                listDropdownPosition.push({
                  top: Platform.OS === 'ios' ? py : py + h,
                  right: 20,
                })
                // After get all section list dropdown position
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
        1500,
      )
    }

    const { dropdownOpenedIndex, listDropdownPosition } = RnDropdownSectionList

    const sectionListData: SectionListData<UcBuddy, DefaultSectionT>[] = toJS(
      p.sectionListData,
    ) //p.sectionListData

    return (
      <Fragment>
        <SectionList
          sections={sectionListData}
          keyExtractor={item => item.user_id}
          renderItem={({
            item,
            index,
            section,
          }: {
            item: UcBuddy
            index: Number
            section: SectionListData<UcBuddy, DefaultSectionT>
          }) => (
            <RenderItemUser
              sectionListData={sectionListData}
              item={item}
              title={section.title}
              isEditMode={p?.isEditMode}
            />
          )}
          renderSectionHeader={({ section: { title, data } }) => (
            <RenderHeaderSection
              sectionHeaderRefs={sectionHeaderRefs}
              sectionListData={sectionListData}
              isEditMode={p.isEditMode}
              title={title}
              data={data}
            />
          )}
        />
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
const getLastMessageChat = (id: string) => {
  const chats = filterTextOnly(chatStore.messagesByThreadId[id])
  return chats.length !== 0 ? chats[chats.length - 1] : ({} as ChatMessage)
}
type ItemUser = {
  sectionListData: SectionListData<UcBuddy, DefaultSectionT>[]
  item: UcBuddy
  title: string
  isEditMode?: boolean
}
const RenderItemUser = observer(
  ({ sectionListData, item, title, isEditMode }: ItemUser) => {
    const index = sectionListData.findIndex(i => i.title === title)
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
        {isEditMode ? (
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
                userStore.selectedUserIds[item.user_id]
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
  },
)
type SectionHeader = {
  sectionHeaderRefs: React.MutableRefObject<View[]>
  sectionListData: SectionListData<UcBuddy, DefaultSectionT>[]
  isEditMode?: boolean
  title: string
  data: readonly UcBuddy[]
}

const RenderHeaderSection = observer(
  ({
    sectionHeaderRefs,
    sectionListData,
    isEditMode,
    title,
    data,
  }: SectionHeader) => {
    const index = sectionListData.findIndex(i => i.title === title)
    const selectedItemCount = userStore.isSelectedAddAllUser
      ? data.length
      : data.filter(i => userStore.selectedUserIds[i.user_id]).length
    const isHidden = RnDropdownSectionList.hiddenGroupIndex.some(
      i => i === index,
    )
    const isDisableMarginTop =
      sectionListData[index - 1]?.data?.length === 0 ||
      RnDropdownSectionList.hiddenGroupIndex.some(idx => idx === index - 1)

    return (
      <RnTouchableOpacity
        onPress={() => RnDropdownSectionList.toggleSection(index, data.length)}
      >
        <View
          style={[
            css.headerSectionList,
            isDisableMarginTop && css.disableMarginTop,
          ]}
          ref={c => {
            if (c && isEditMode) {
              sectionHeaderRefs.current[index] = c
            }
          }}
        >
          <Fragment>
            <View style={css.leftSection}>
              <View>
                <RnIcon path={isHidden ? mdiMenuRight : mdiMenuDown} />
              </View>
              <RnText small>{`${title} ${
                isEditMode
                  ? selectedItemCount
                  : data.filter(itm => itm.status === 'online').length
              }/${data.length}`}</RnText>
            </View>
            {isEditMode && (
              <RnTouchableOpacity
                style={css.editGroupIcon}
                onPress={() => {
                  if (
                    RnDropdownSectionList.hiddenGroupIndex.some(
                      i => i === index,
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
  },
)
