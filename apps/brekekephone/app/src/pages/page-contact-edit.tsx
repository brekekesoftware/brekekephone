import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import type { ScrollView } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native'

import { View } from '@/rn/core/components/view'
import { mdiFolderPlus } from '#/assets/icons'
import { ContactList } from '#/components/contact-list'
import { ContactSectionList } from '#/components/contact-section-list'
import type { DropdownItemProps } from '#/components/dropdown-item'
import { Layout } from '#/components/layout'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { RnIcon } from '#/components/rn-icon'
import { RnText } from '#/components/rn-text'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { SelectionItem } from '#/components/selection-item'
import { defaultTimeout } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnDropdown } from '#/stores/rn-dropdown'
import { BackgroundTimer } from '#/utils/background-timer'

export const PageContactEdit = observer(() => {
  const [didMount, setDidMount] = useState(false)
  const viewRef = useRef<ScrollView | undefined>(undefined)

  useEffect(() => {
    if (ctx.auth.getCurrentAccount()?.ucEnabled) {
      ctx.user.loadUcBuddyList(true)
    } else {
      ctx.user.loadPbxBuddyList(true)
    }
    BackgroundTimer.setTimeout(() => setDidMount(true), defaultTimeout)
  }, [])

  const getDDOptions = (ddIndex: number): DropdownItemProps[] => [
    {
      title: intl`Add/Remove user`,
      onPress: () => onAddRemoveUser(ddIndex),
      disabled: ctx.user.dataGroupAllUser.length - 1 === ddIndex,
    },
    {
      title: intl`Check all`,
      onPress: (e?: MouseEvent) => {
        e?.stopPropagation?.()
        onCheckAll(ddIndex)
      },
      disabled:
        ctx.user.isSelectedAddAllUser ||
        !ctx.user.dataGroupAllUser[ddIndex]?.data?.length,
    },
    {
      title: intl`Uncheck all`,
      onPress: (e?: MouseEvent) => {
        e?.stopPropagation?.()
        onUncheckAll(ddIndex)
      },
      disabled:
        ctx.user.isSelectedAddAllUser ||
        !ctx.user.dataGroupAllUser[ddIndex]?.data?.length,
    },
    {
      title: intl`Remove group`,
      onPress: () => onRemoveGroup(ddIndex),
      disabled: ctx.user.dataGroupAllUser.length - 1 === ddIndex,
    },
  ]

  const onAddRemoveUser = (ddIndex: number) => {
    RnDropdown.close()
    ctx.nav.goToPageContactGroupEdit({
      groupName: ctx.user.dataGroupAllUser[ddIndex].title,
      listItem: ctx.user.dataGroupAllUser[ddIndex].data.map(itm => itm),
    })
    scrollToTopListContact()
  }

  const onCheckAll = (groupIndex: number) => {
    RnDropdown.close()
    ctx.user.selectAllUserIdsByGroup(groupIndex)
  }

  const onUncheckAll = (groupIndex: number) => {
    RnDropdown.close()
    ctx.user.unselectAllUserIdsByGroup(groupIndex)
  }

  const onRemoveGroup = (ddIndex: number) => {
    RnDropdown.close()
    RnDropdown.removeSection(
      ddIndex,
      ctx.user.dataGroupAllUser[ddIndex]?.data?.length,
    )
    ctx.user.removeGroup(ddIndex)
  }

  const onSelectEditGroupingAndUserOrderOption = () => {
    RnDropdown.close()
    if (!ctx.user.isSelectEditGroupingAndUserOrder) {
      RnDropdown.setShouldUpdatePosition(true)
    }
    ctx.user.toggleIsSelectEditGroupingAndUserOrder()
  }

  const onAddGroup = () => {
    ctx.nav.goToPageContactGroupCreate()
    scrollToTopListContact()
  }

  const onGoBack = () => {
    if (ctx.auth.getCurrentAccount()?.ucEnabled) {
      ctx.user.loadUcBuddyList()
    }
    RnDropdown.close()
    ctx.nav.backToPageContactUsers()
  }

  const scrollToTopListContact = () =>
    BackgroundTimer.setTimeout(() => {
      viewRef.current?.scrollTo({ y: 0, animated: true })
    }, 1000)

  const saveUC = () => {
    const { isSelectedAddAllUser, groups, dataListAllUser, selectedUserIds } =
      ctx.user
    const data = [
      ...groups,
      ...dataListAllUser.filter(u => selectedUserIds[u.user_id]),
    ]
    ctx.uc
      .saveProperties(!isSelectedAddAllUser, data)
      .then(onSaveSuccess)
      .catch(onSaveFailure)
  }
  const savePBX = () => {
    const { isSelectedAddAllUser, groups, dataListAllUser, selectedUserIds } =
      ctx.user
    const data = {
      screened: !isSelectedAddAllUser,
      users: [
        ...groups,
        ...dataListAllUser.filter(u => selectedUserIds[u.user_id]),
      ],
    }
    ctx.auth.savePbxBuddyList(data)
    ctx.user.updateDisplayGroupList()
    onGoBack()
  }
  const save = () => {
    const { isCapacityInvalid, type } = ctx.user
    if (isCapacityInvalid) {
      return
    }
    if (type === 'UcBuddy') {
      saveUC()
    } else {
      savePBX()
    }
  }
  const onSaveSuccess = () => {
    ctx.account.saveAccountsToLocalStorageDebounced()
    ctx.user.updateDisplayGroupList()
    onGoBack()
  }
  const onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save user list`,
      err,
    })
  }

  const {
    buddyMax,
    dataListAllUser,
    isSelectedAddAllUser,
    selectedUserIds,
    isDisableAddAllUserToTheList,
    isSelectEditGroupingAndUserOrder,
    isCapacityInvalid,
    dataGroupAllUser,
    buddyMode,
  } = ctx.user
  const { openedIndex } = RnDropdown
  return (
    <Layout
      fabOnBack={onGoBack}
      fabOnNext={save}
      fabOnNextText={intl`SAVE`}
      onBack={onGoBack}
      title={intl`Edit buddy list`}
      containerRef={(ref: ScrollView) => {
        viewRef.current = ref
      }}
    >
      <TouchableWithoutFeedback onPress={RnDropdown.close}>
        <View className='px-2.5'>
          {!isDisableAddAllUserToTheList && (
            <SelectionItem
              isSelected={isSelectedAddAllUser}
              onPress={ctx.user.toggleIsSelectedAddAllUser}
              title={intl`Add all user to the list`}
            />
          )}
          <View className='flex-row justify-between'>
            <SelectionItem
              isSelected={isSelectEditGroupingAndUserOrder}
              onPress={onSelectEditGroupingAndUserOrderOption}
              title={
                buddyMode === 2
                  ? intl`Edit grouping and user order`
                  : intl`Display with grouping`
              }
            />
            {isSelectEditGroupingAndUserOrder && buddyMode === 2 && (
              <RnTouchableOpacity onPress={onAddGroup}>
                <RnIcon path={mdiFolderPlus} className='text-foreground' />
              </RnTouchableOpacity>
            )}
          </View>
          <View className='my-2.5 flex-row items-center justify-end'>
            <View className='flex-row items-center'>
              <RnText>{`${intl`Capacity`}`}</RnText>
              <RnText
                className={!isCapacityInvalid ? 'text-error' : undefined}
              >{`    ${
                isSelectedAddAllUser
                  ? dataListAllUser.length
                  : Object.keys(selectedUserIds).length
              }`}</RnText>
              <RnText>{` / ${buddyMax}`}</RnText>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {!didMount ? (
        <RnActivityIndicator
          className='mt-5 h-9 w-9 self-center'
          size='small'
        />
      ) : isSelectEditGroupingAndUserOrder ? (
        <ContactSectionList
          sectionListData={dataGroupAllUser}
          isEditMode={true}
          ddItems={getDDOptions(openedIndex)}
        />
      ) : (
        <ContactList data={dataListAllUser} />
      )}
    </Layout>
  )
})
