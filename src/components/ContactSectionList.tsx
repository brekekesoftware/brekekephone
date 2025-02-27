import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import type { FC, MutableRefObject } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import type { ViewProps } from 'react-native'
import {
  Platform,
  SectionList,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import {
  mdiMenuDown,
  mdiMenuRight,
  mdiMoreHoriz,
  mdiPhone,
  mdiPhoneForward,
  mdiVideo,
} from '../assets/icons'
import type { UcBuddy } from '../brekekejs'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import type { ChatMessage } from '../stores/chatStore'
import { chatStore } from '../stores/chatStore'
import { Nav } from '../stores/Nav'
import type { DropdownPosition } from '../stores/RnDropdown'
import { RnDropdown } from '../stores/RnDropdown'
import type { GroupUserSectionListData } from '../stores/userStore'
import { userStore } from '../stores/userStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { filterTextOnly } from '../utils/formatChatContent'
import { UserItem } from './ContactUserItem'
import { Dropdown } from './Dropdown'
import type { DropdownItemProps } from './DropdownItem'
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
  sectionListData: GroupUserSectionListData[]
  isEditMode?: boolean
  ddItems?: DropdownItemProps[]
  isTransferCall?: boolean
}
export const ContactSectionList: FC<ViewProps & ContactSectionListProps> =
  observer(p => {
    const sectionHeaderRefs = useRef<View[]>([])
    const reCalculatedLayoutDropdownTimeoutId = useRef<number>(0)

    useEffect(() => {
      RnDropdown.setShouldUpdatePosition(true)
      return () => {
        sectionHeaderRefs.current = []
        if (reCalculatedLayoutDropdownTimeoutId.current) {
          BackgroundTimer.clearTimeout(
            reCalculatedLayoutDropdownTimeoutId.current,
          )
        }
      }
    }, [])

    useEffect(() => {
      if (p.isEditMode && RnDropdown.shouldUpdatePosition) {
        // recalculate position header dropdown
        RnDropdown.setShouldUpdatePosition(false)
        calculateSectionHeaderPosition()
      }
    }, [p.isEditMode, RnDropdown.shouldUpdatePosition])

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
      // must wrap in setTimeout to make sure the header view has completed render
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
                // after get all section list dropdown position
                if (index === sectionHeaderRefs.current.length - 1) {
                  RnDropdown.setPositions(listDropdownPosition)
                  RnDropdown.setHeaderHeight(h)
                }
              })
            }
          })
        },
        500,
      )
    }

    const { openedIndex, positions } = RnDropdown

    const sectionListData: GroupUserSectionListData[] = toJS(p.sectionListData) // p.sectionListData

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
            section: GroupUserSectionListData
          }) => (
            <RenderItemUser
              sectionListData={sectionListData}
              item={item}
              title={section.title}
              isEditMode={p?.isEditMode}
              isTransferCall={p?.isTransferCall}
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
        {openedIndex >= 0 && (
          <TouchableWithoutFeedback onPress={() => RnDropdown.close()}>
            <View style={css.containerDropdown}>
              <Dropdown position={positions[openedIndex]} items={p.ddItems} />
            </View>
          </TouchableWithoutFeedback>
        )}
      </Fragment>
    )
  })
const getLastMessageChat = (id: string) => {
  const chats = filterTextOnly(chatStore.getMessagesByThreadId(id))
  return chats.length ? chats[chats.length - 1] : ({} as ChatMessage)
}
type ItemUser = {
  sectionListData: GroupUserSectionListData[]
  item: UcBuddy
  title: string
  isEditMode?: boolean
  isTransferCall?: boolean
}
const RenderItemUser = observer(
  ({ sectionListData, item, title, isEditMode, isTransferCall }: ItemUser) => {
    const index = sectionListData.findIndex(i => i.title === title)
    const hidden = RnDropdown.hiddenIndexes.some(idx => idx === index)
    const oc = getCallStore().getOngoingCall()

    return !hidden ? (
      <View
        key={`ItemUser-${item.user_id}-${index}`}
        onLayout={e => {
          RnDropdown.setItemHeight(e.nativeEvent.layout.height)
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
        ) : !isTransferCall ? (
          <UserItem
            iconFuncs={[
              () => getCallStore().startVideoCall(item.user_id),
              () => getCallStore().startCall(item.user_id),
            ]}
            icons={[mdiVideo, mdiPhone]}
            lastMessage={getLastMessageChat(item.user_id)?.text}
            id={item.user_id}
            name={item.name}
            avatar={item.profile_image_url}
            status={item.status}
            canTouch
            onPress={
              getAuthStore().getCurrentAccount()?.ucEnabled
                ? () => Nav().goToPageChatDetail({ buddy: item.user_id })
                : undefined
            }
          />
        ) : (
          <UserItem
            iconFuncs={[
              () => oc?.transferAttended(item.user_id),
              () => oc?.transferBlind(item.user_id),
            ]}
            icons={[mdiPhoneForward, mdiPhone]}
            id={item.user_id}
            name={item.name}
            avatar={item.profile_image_url}
            status={item.status}
          />
        )}
      </View>
    ) : null
  },
)
type SectionHeader = {
  sectionHeaderRefs: MutableRefObject<View[]>
  sectionListData: GroupUserSectionListData[]
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
    const hidden = RnDropdown.hiddenIndexes.some(i => i === index)
    const titleHeaderRender = userStore.getHeaderTitle(title, data, isEditMode)

    const isDisableMarginTop =
      !sectionListData[index - 1]?.data?.length ||
      RnDropdown.hiddenIndexes.some(idx => idx === index - 1)

    return (
      <RnTouchableOpacity
        onPress={() => RnDropdown.toggleSection(index, data.length)}
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
                <RnIcon path={hidden ? mdiMenuRight : mdiMenuDown} />
              </View>
              <RnText small>{titleHeaderRender}</RnText>
            </View>
            {isEditMode && (
              <RnTouchableOpacity
                style={css.editGroupIcon}
                onPress={() => {
                  if (RnDropdown.hiddenIndexes.some(i => i === index)) {
                    RnDropdown.toggleSection(index, data.length)
                  }
                  RnDropdown.toggle(index)
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
