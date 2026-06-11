import { View } from '@rntwsc/rn/core/components/view'
import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import type { FC, MutableRefObject } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import type { View as RNView, ViewProps } from 'react-native'
import { SectionList, TouchableWithoutFeedback } from 'react-native'

import {
  mdiMenuDown,
  mdiMenuRight,
  mdiMoreHoriz,
  mdiPhone,
  mdiPhoneForward,
  mdiVideo,
} from '#/assets/icons'
import type { UcBuddy } from '#/brekekejs'
import { UserItem } from '#/components/contact-user-item'
import { Dropdown } from '#/components/dropdown'
import type { DropdownItemProps } from '#/components/dropdown-item'
import { RnIcon } from '#/components/rn-icon'
import { RnText } from '#/components/rn-text'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ChatMessage } from '#/stores/chat-store'
import { ctx } from '#/stores/ctx'
import { RnDropdown } from '#/stores/rn-dropdown'
import type { GroupUserSectionListData } from '#/stores/user-store'
import { filterTextOnly } from '#/utils/format-chat-content'

type ContactSectionListProps = {
  sectionListData: GroupUserSectionListData[]
  isEditMode?: boolean
  ddItems?: DropdownItemProps[]
  isTransferCall?: boolean
}
export const ContactSectionList: FC<ViewProps & ContactSectionListProps> =
  observer(p => {
    const sectionHeaderRefs = useRef<RNView[]>([])
    const rootRef = useRef<RNView | null>(null)
    useEffect(
      () => () => {
        sectionHeaderRefs.current = []
      },
      [],
    )

    // Measure the section header bottom relative to the wrapper (rootRef) by
    // calling measure() on both nodes and subtracting, instead of measureLayout()
    // whose callbacks are unreliable/out-of-order on Android. On web there is no
    // wrapper so the window-absolute value is used directly.
    const measureHeaderPosition = (
      index: number,
      collect: (top: number, height: number) => void,
    ) => {
      const ref = sectionHeaderRefs.current[index]
      if (!ref) {
        return
      }

      const measureHeader = (rootTop = 0) => {
        ref.measure((fx, fy, w, h, px, py) => collect(py - rootTop + h, h))
      }

      if (isWeb || !rootRef.current) {
        measureHeader()
        return
      }

      rootRef.current.measure((fx, fy, w, h, px, py) => measureHeader(py))
    }

    // Measure on demand when the menu is tapped so the position is always fresh
    // (no stale batch, no async ordering). Open only after the position is set so
    // the dropdown never renders at top:0.
    const measureAndToggleDropdown = (index: number) => {
      if (RnDropdown.openedIndex === index) {
        RnDropdown.close()
        return
      }
      measureHeaderPosition(index, (top, h) => {
        RnDropdown.setPosition(index, {
          top,
          right: 20,
        })
        RnDropdown.setHeaderHeight(h)
        RnDropdown.open(index)
      })
    }

    const { openedIndex, positions } = RnDropdown
    const dropdownPosition =
      openedIndex >= 0 ? positions[openedIndex] : undefined

    const sectionListData: GroupUserSectionListData[] = toJS(p.sectionListData) // p.sectionListData

    const body = (
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
              onDropdownPress={measureAndToggleDropdown}
            />
          )}
        />
        {openedIndex >= 0 && dropdownPosition && (
          <TouchableWithoutFeedback onPress={() => RnDropdown.close()}>
            <View className='absolute h-full w-full bg-transparent'>
              <Dropdown position={dropdownPosition} items={p.ddItems} />
            </View>
          </TouchableWithoutFeedback>
        )}
      </Fragment>
    )
    // web keeps the original window-absolute measure with no wrapper (a relative
    // View wrapper would become the overlay's offsetParent and shift it). native
    // wraps in a View so measureLayout has a stable reference matching the overlay.
    return isWeb ? (
      body
    ) : (
      <View
        ref={c => {
          rootRef.current = c
        }}
      >
        {body}
      </View>
    )
  })
const getLastMessageChat = (id: string) => {
  const chats = filterTextOnly(ctx.chat.getMessagesByThreadId(id))
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
    const oc = ctx.call.getOngoingCall()

    return !hidden ? (
      <View
        key={`ItemUser-${item.user_id}-${index}`}
        onLayout={e => {
          RnDropdown.setItemHeight(e.nativeEvent.layout.height)
        }}
      >
        {isEditMode ? (
          <RnTouchableOpacity
            onPress={() => ctx.user.selectUserId(item.user_id)}
            disabled={ctx.user.isSelectedAddAllUser}
          >
            <UserItem
              id={item.user_id}
              name={item.name || item.user_id}
              avatar={item.profile_image_url}
              disabled={ctx.user.isSelectedAddAllUser}
              isSelected={
                ctx.user.isSelectedAddAllUser ||
                ctx.user.selectedUserIds[item.user_id]
              }
              onSelect={() => ctx.user.selectUserId(item.user_id)}
              isSelection
            />
          </RnTouchableOpacity>
        ) : !isTransferCall ? (
          <UserItem
            iconFuncs={[
              () => ctx.call.startVideoCall(item.user_id),
              () => ctx.call.startCall(item.user_id),
            ]}
            loadings
            icons={[mdiVideo, mdiPhone]}
            lastMessage={getLastMessageChat(item.user_id)?.text}
            id={item.user_id}
            name={item.name}
            avatar={item.profile_image_url}
            status={item.status}
            canTouch
            onPress={
              ctx.auth.getCurrentAccount()?.ucEnabled
                ? () =>
                    ctx.nav.goToPageChatDetail({
                      buddy: item.user_id,
                    })
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
  sectionHeaderRefs: MutableRefObject<RNView[]>
  sectionListData: GroupUserSectionListData[]
  isEditMode?: boolean
  title: string
  data: readonly UcBuddy[]
  onDropdownPress: (index: number) => void
}

const RenderHeaderSection = observer(
  ({
    sectionHeaderRefs,
    sectionListData,
    isEditMode,
    title,
    data,
    onDropdownPress,
  }: SectionHeader) => {
    const index = sectionListData.findIndex(i => i.title === title)
    const hidden = RnDropdown.hiddenIndexes.some(i => i === index)
    const titleHeaderRender = ctx.user.getHeaderTitle(title, data, isEditMode)

    const isDisableMarginTop =
      !sectionListData[index - 1]?.data?.length ||
      RnDropdown.hiddenIndexes.some(idx => idx === index - 1)

    return (
      <RnTouchableOpacity
        onPress={() => RnDropdown.toggleSection(index, data.length)}
      >
        <View
          className={[
            'bg-border mt-3.75 flex-row items-center justify-between px-1.25 py-3',
            isDisableMarginTop && 'mt-0',
          ]}
          ref={c => {
            if (c && isEditMode) {
              sectionHeaderRefs.current[index] = c
            }
          }}
        >
          <Fragment>
            <View className='flex-row items-center'>
              <View>
                <RnIcon
                  className='text-foreground'
                  path={hidden ? mdiMenuRight : mdiMenuDown}
                />
              </View>
              <RnText small className='text-foreground'>
                {titleHeaderRender}
              </RnText>
            </View>
            {isEditMode && (
              <RnTouchableOpacity
                className='px-2.5'
                onPress={() => {
                  if (RnDropdown.hiddenIndexes.some(i => i === index)) {
                    RnDropdown.toggleSection(index, data.length)
                  }
                  onDropdownPress(index)
                }}
              >
                <RnIcon path={mdiMoreHoriz} className='text-foreground' />
              </RnTouchableOpacity>
            )}
          </Fragment>
        </View>
      </RnTouchableOpacity>
    )
  },
)
