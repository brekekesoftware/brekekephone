import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
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

export const PageContactEdit = observer(
  class PageContactEdit extends Component {
    state = { didMount: false }

    componentDidMount = () => {
      if (ctx.auth.getCurrentAccount()?.ucEnabled) {
        ctx.user.loadUcBuddyList(true)
      } else {
        ctx.user.loadPbxBuddyList(true)
      }
      BackgroundTimer.setTimeout(
        () => this.setState({ didMount: true }),
        defaultTimeout,
      )
    }
    getDDOptions = (ddIndex: number): DropdownItemProps[] => [
      {
        title: intl`Add/Remove user`,
        onPress: () => this.onAddRemoveUser(ddIndex),
        disabled: ctx.user.dataGroupAllUser.length - 1 === ddIndex,
      },
      {
        title: intl`Check all`,
        onPress: (e?: MouseEvent) => {
          e?.stopPropagation?.()
          this.onCheckAll(ddIndex)
        },
        disabled:
          ctx.user.isSelectedAddAllUser ||
          !ctx.user.dataGroupAllUser[ddIndex]?.data?.length,
      },
      {
        title: intl`Uncheck all`,
        onPress: (e?: MouseEvent) => {
          e?.stopPropagation?.()
          this.onUncheckAll(ddIndex)
        },
        disabled:
          ctx.user.isSelectedAddAllUser ||
          !ctx.user.dataGroupAllUser[ddIndex]?.data?.length,
      },
      {
        title: intl`Remove group`,
        onPress: () => this.onRemoveGroup(ddIndex),
        disabled: ctx.user.dataGroupAllUser.length - 1 === ddIndex,
      },
    ]

    onAddRemoveUser = (ddIndex: number) => {
      RnDropdown.close()
      ctx.nav.goToPageContactGroupEdit({
        groupName: ctx.user.dataGroupAllUser[ddIndex].title,
        listItem: ctx.user.dataGroupAllUser[ddIndex].data.map(itm => itm),
      })
      this.scrollToTopListContact()
    }

    onCheckAll = (groupIndex: number) => {
      RnDropdown.close()
      ctx.user.selectAllUserIdsByGroup(groupIndex)
    }

    onUncheckAll = (groupIndex: number) => {
      RnDropdown.close()
      ctx.user.unselectAllUserIdsByGroup(groupIndex)
    }

    onRemoveGroup = (ddIndex: number) => {
      RnDropdown.close()
      RnDropdown.removeSection(
        ddIndex,
        ctx.user.dataGroupAllUser[ddIndex]?.data?.length,
      )
      ctx.user.removeGroup(ddIndex)
    }

    onSelectEditGroupingAndUserOrderOption = () => {
      RnDropdown.close()
      if (!ctx.user.isSelectEditGroupingAndUserOrder) {
        RnDropdown.setShouldUpdatePosition(true)
      }
      ctx.user.toggleIsSelectEditGroupingAndUserOrder()
    }

    onAddGroup = () => {
      ctx.nav.goToPageContactGroupCreate()
      this.scrollToTopListContact()
    }

    onGoBack = () => {
      if (ctx.auth.getCurrentAccount()?.ucEnabled) {
        ctx.user.loadUcBuddyList()
      }
      RnDropdown.close()
      ctx.nav.backToPageContactUsers()
    }

    view?: ScrollView
    setViewRef = (ref: ScrollView) => {
      this.view = ref
    }

    scrollToTopListContact = () =>
      BackgroundTimer.setTimeout(() => {
        this.view?.scrollTo({ y: 0, animated: true })
      }, 1000)

    render() {
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
          fabOnBack={this.onGoBack}
          fabOnNext={this.save}
          fabOnNextText={intl`SAVE`}
          onBack={this.onGoBack}
          title={intl`Edit buddy list`}
          containerRef={this.setViewRef}
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
                  onPress={this.onSelectEditGroupingAndUserOrderOption}
                  title={
                    buddyMode === 2
                      ? intl`Edit grouping and user order`
                      : intl`Display with grouping`
                  }
                />
                {isSelectEditGroupingAndUserOrder && buddyMode === 2 && (
                  <RnTouchableOpacity onPress={this.onAddGroup}>
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
          {!this.state.didMount ? (
            <RnActivityIndicator
              className='mt-5 h-9 w-9 self-center'
              size='small'
            />
          ) : isSelectEditGroupingAndUserOrder ? (
            <ContactSectionList
              sectionListData={dataGroupAllUser}
              isEditMode={true}
              ddItems={this.getDDOptions(openedIndex)}
            />
          ) : (
            <ContactList data={dataListAllUser} />
          )}
        </Layout>
      )
    }

    saveUC = () => {
      const { isSelectedAddAllUser, groups, dataListAllUser, selectedUserIds } =
        ctx.user
      const data = [
        ...groups,
        ...dataListAllUser.filter(u => selectedUserIds[u.user_id]),
      ]
      ctx.uc
        .saveProperties(!isSelectedAddAllUser, data)
        .then(this.onSaveSuccess)
        .catch(this.onSaveFailure)
    }
    savePBX = () => {
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
      this.onGoBack()
    }
    save = () => {
      const { isCapacityInvalid, type } = ctx.user
      if (isCapacityInvalid) {
        return
      }
      if (type === 'UcBuddy') {
        this.saveUC()
      } else {
        this.savePBX()
      }
    }
    onSaveSuccess = () => {
      ctx.account.saveAccountsToLocalStorageDebounced()
      ctx.user.updateDisplayGroupList()
      this.onGoBack()
    }
    onSaveFailure = (err: Error) => {
      RnAlert.error({
        message: intlDebug`Failed to save user list`,
        err,
      })
    }
  },
)
