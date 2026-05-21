import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import type { FC, MutableRefObject } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import type { ViewProps } from 'react-native'
import {
  findNodeHandle,
  SectionList,
  TouchableWithoutFeedback,
  View as RNView,
} from 'react-native'

import { View } from '@/rn/core/components/view'
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
import { isWeb } from '#/config'
import type { ChatMessage } from '#/stores/chat-store'
import { ctx } from '#/stores/ctx'
import type { DropdownPosition } from '#/stores/rn-dropdown'
import { RnDropdown } from '#/stores/rn-dropdown'
import type { GroupUserSectionListData } from '#/stores/user-store'
import { BackgroundTimer } from '#/utils/background-timer'
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
          const collect = (index: number, top: number, h: number) => {
            listDropdownPosition.push({ top, right: 20 })
            // after get all section list dropdown position
            if (index === sectionHeaderRefs.current.length - 1) {
              RnDropdown.setPositions(listDropdownPosition)
              RnDropdown.setHeaderHeight(h)
            }
          }
          // native: measure relative to the wrapper (rootRef) so the dropdown
          // shares the same coordinate origin as its absolute overlay
          // (window-absolute measure was off on Android). web: keep the original
          // window-absolute measure (findNodeHandle/measureLayout throw on web).
          const rootNode = isWeb ? null : findNodeHandle(rootRef.current)
          sectionHeaderRefs.current.forEach((ref: RNView, index) => {
            if (!ref) {
              return
            }
            if (rootNode) {
              ref.measureLayout(rootNode, (x, y, w, h) =>
                collect(index, y + h, h),
              )
            } else {
              ref.measure((fx, fy, w, h, px, py) =>
                collect(index, py + h, h),
              )
            }
          })
        },
        500,
      )
    }

    const { openedIndex, positions } = RnDropdown

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
            />
          )}
        />
        {openedIndex >= 0 && (
          <TouchableWithoutFeedback onPress={() => RnDropdown.close()}>
            <View className='absolute w-full h-full bg-transparent'>
              <Dropdown position={positions[openedIndex]} items={p.ddItems} />
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
                ? () => ctx.nav.goToPageChatDetail({ buddy: item.user_id })
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
            'flex-row justify-between bg-border px-1.25 items-center py-3 mt-3.75',
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
                <RnIcon path={hidden ? mdiMenuRight : mdiMenuDown} />
              </View>
              <RnText small>{titleHeaderRender}</RnText>
            </View>
            {isEditMode && (
              <RnTouchableOpacity
                className='px-2.5'
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
