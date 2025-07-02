import { observer } from 'mobx-react'
import { Component } from 'react'
import type { ScrollView } from 'react-native'
import {
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { mdiFolderPlus } from '#/assets/icons'
import { ContactList } from '#/components/ContactList'
import { ContactSectionList } from '#/components/ContactSectionList'
import type { DropdownItemProps } from '#/components/DropdownItem'
import { Layout } from '#/components/Layout'
import { RnIcon } from '#/components/RnIcon'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { SelectionItem } from '#/components/SelectionItem'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { RnDropdown } from '#/stores/RnDropdown'
import { userStore } from '#/stores/userStore'
import { BackgroundTimer } from '#/utils/BackgroundTimer'

export const css = StyleSheet.create({
  listHeaderSection: {
    paddingHorizontal: 10,
  },
  listTitleSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowGroupTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  loadingIcon: {
    marginTop: 20,
  },
})

@observer
export class PageContactEdit extends Component {
  state = { didMount: false }

  componentDidMount = () => {
    if (ctx.auth.getCurrentAccount()?.ucEnabled) {
      userStore.loadUcBuddyList(true)
    } else {
      userStore.loadPbxBuddyList(true)
    }
    BackgroundTimer.setTimeout(() => this.setState({ didMount: true }), 300)
  }
  getDDOptions = (ddIndex: number): DropdownItemProps[] => [
    {
      title: intl`Add/Remove user`,
      onPress: () => this.onAddRemoveUser(ddIndex),
      disabled: userStore.dataGroupAllUser.length - 1 === ddIndex,
    },
    {
      title: intl`Check all`,
      onPress: (e?: MouseEvent) => {
        e?.stopPropagation?.()
        this.onCheckAll(ddIndex)
      },
      disabled:
        userStore.isSelectedAddAllUser ||
        !userStore.dataGroupAllUser[ddIndex]?.data?.length,
    },
    {
      title: intl`Uncheck all`,
      onPress: (e?: MouseEvent) => {
        e?.stopPropagation?.()
        this.onUncheckAll(ddIndex)
      },
      disabled:
        userStore.isSelectedAddAllUser ||
        !userStore.dataGroupAllUser[ddIndex]?.data?.length,
    },
    {
      title: intl`Remove group`,
      onPress: () => this.onRemoveGroup(ddIndex),
      disabled: userStore.dataGroupAllUser.length - 1 === ddIndex,
    },
  ]

  onAddRemoveUser = (ddIndex: number) => {
    RnDropdown.close()
    ctx.nav.goToPageContactGroupEdit({
      groupName: userStore.dataGroupAllUser[ddIndex].title,
      listItem: userStore.dataGroupAllUser[ddIndex].data.map(itm => itm),
    })
    this.scrollToTopListContact()
  }

  onCheckAll = (groupIndex: number) => {
    RnDropdown.close()
    userStore.selectAllUserIdsByGroup(groupIndex)
  }

  onUncheckAll = (groupIndex: number) => {
    RnDropdown.close()
    userStore.unselectAllUserIdsByGroup(groupIndex)
  }

  onRemoveGroup = (ddIndex: number) => {
    RnDropdown.close()
    RnDropdown.removeSection(
      ddIndex,
      userStore.dataGroupAllUser[ddIndex]?.data?.length,
    )
    userStore.removeGroup(ddIndex)
  }

  onSelectEditGroupingAndUserOrderOption = () => {
    RnDropdown.close()
    if (!userStore.isSelectEditGroupingAndUserOrder) {
      RnDropdown.setShouldUpdatePosition(true)
    }
    userStore.toggleIsSelectEditGroupingAndUserOrder()
  }

  onAddGroup = () => {
    ctx.nav.goToPageContactGroupCreate()
    this.scrollToTopListContact()
  }

  onGoBack = () => {
    if (ctx.auth.getCurrentAccount()?.ucEnabled) {
      userStore.loadUcBuddyList()
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
    } = userStore
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
          <View style={css.listHeaderSection}>
            {!isDisableAddAllUserToTheList && (
              <SelectionItem
                isSelected={isSelectedAddAllUser}
                onPress={userStore.toggleIsSelectedAddAllUser}
                title={intl`Add all user to the list`}
              />
            )}
            <View style={css.rowGroupTitle}>
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
                  <RnIcon path={mdiFolderPlus} />
                </RnTouchableOpacity>
              )}
            </View>
            <View style={css.listTitleSection}>
              <View style={css.rowCapacity}>
                <RnText>{`${intl`Capacity`}`}</RnText>
                <RnText style={isCapacityInvalid && css.errorText}>{`    ${
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
          <ActivityIndicator style={css.loadingIcon} size='large' />
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
      userStore
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
      userStore
    const data = {
      screened: !isSelectedAddAllUser,
      users: [
        ...groups,
        ...dataListAllUser.filter(u => selectedUserIds[u.user_id]),
      ],
    }
    ctx.auth.savePbxBuddyList(data)
    userStore.updateDisplayGroupList()
    this.onGoBack()
  }
  save = () => {
    const { isCapacityInvalid, type } = userStore
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
    userStore.updateDisplayGroupList()
    this.onGoBack()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save user list`,
      err,
    })
  }
}
