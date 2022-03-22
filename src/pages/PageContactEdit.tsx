// eslint-disable-next-line simple-import-sort/imports
import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native'

import { Layout } from '../components/Layout'
import { SelectionItem } from '../components/SelectionItem'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'

import { DropdownItemProps } from '../components/DropdownItem'

import { userStore } from '../stores/userStore'
import { RnDropdownSectionList } from '../stores/RnDropdownSectionList'
import { observer } from 'mobx-react'
import { uc } from '../api/uc'
import { RnAlert } from '../stores/RnAlert'
import { ContactSectionList } from '../components/ContactSectionList'
import { ContactList } from '../components/ContactList'
import { RnTouchableOpacity } from '../components/RnTouchableOpacity'
import { RnIcon } from '../components/RnIcon'
import { mdiFolderPlus } from '../assets/icons'
import { RnText } from '../components/RnText'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { getAuthStore } from '../stores/authStore'
import { profileStore } from '../stores/profileStore'

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
    if (getAuthStore().currentProfile?.ucEnabled) {
      userStore.loadUcBuddyList(true)
    } else {
      userStore.loadPbxBuddyList(true)
    }
    setTimeout(() => this.setState({ didMount: true }), 300)
  }
  getDDOptions = (ddIndex: number): DropdownItemProps[] => {
    return [
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
          userStore.dataGroupAllUser[ddIndex]?.data?.length === 0,
      },
      {
        title: intl`Uncheck all`,
        onPress: (e?: MouseEvent) => {
          e?.stopPropagation?.()
          this.onUncheckAll(ddIndex)
        },
        disabled:
          userStore.isSelectedAddAllUser ||
          userStore.dataGroupAllUser[ddIndex]?.data?.length === 0,
      },
      {
        title: intl`Remove group`,
        onPress: () => this.onRemoveGroup(ddIndex),
        disabled: userStore.dataGroupAllUser.length - 1 === ddIndex,
      },
    ]
  }

  onAddRemoveUser = (ddIndex: number) => {
    RnDropdownSectionList.closeDropdown()
    Nav().goToPageContactGroupEdit({
      groupName: userStore.dataGroupAllUser[ddIndex].title,
      listItem: userStore.dataGroupAllUser[ddIndex].data.map(itm => itm),
    })
    this.scrollToTopListContact()
  }

  onCheckAll = (groupIndex: number) => {
    RnDropdownSectionList.closeDropdown()
    userStore.selectAllUserIdsByGroup(groupIndex)
  }

  onUncheckAll = (groupIndex: number) => {
    RnDropdownSectionList.closeDropdown()
    userStore.unselectAllUserIdsByGroup(groupIndex)
  }

  onRemoveGroup = (ddIndex: number) => {
    RnDropdownSectionList.closeDropdown()
    RnDropdownSectionList.removeSection(
      ddIndex,
      userStore.dataGroupAllUser[ddIndex]?.data?.length,
    )
    userStore.removeGroup(ddIndex)
  }

  onSelectEditGroupingAndUserOrderOption = () => {
    RnDropdownSectionList.closeDropdown()
    if (!userStore.isSelectEditGroupingAndUserOrder) {
      RnDropdownSectionList.setIsShouldUpdateDropdownPosition(true)
    }
    userStore.toggleIsSelectEditGroupingAndUserOrder()
  }

  onAddGroup = () => {
    Nav().goToPageContactGroupCreate()
    this.scrollToTopListContact()
  }

  onGoBack = () => {
    RnDropdownSectionList.closeDropdown()
    Nav().backToPageContactUsers()
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
    const { dropdownOpenedIndex } = RnDropdownSectionList
    return (
      <Layout
        fabOnBack={this.onGoBack}
        fabOnNext={this.save}
        fabOnNextText={intl`SAVE`}
        onBack={this.onGoBack}
        title={intl`Edit buddy list`}
        containerRef={this.setViewRef}
      >
        <TouchableWithoutFeedback onPress={RnDropdownSectionList.closeDropdown}>
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
            ddItems={this.getDDOptions(dropdownOpenedIndex)}
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
    uc.saveProperties(!isSelectedAddAllUser, data)
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
    getAuthStore().savePbxBuddyList(data)
    userStore.updateDisplayGroupList()
    this.onGoBack()
  }
  save = () => {
    const { isCapacityInvalid, type } = userStore
    if (!isCapacityInvalid) {
      type === 'UcBuddy' ? this.saveUC() : this.savePBX()
    }
  }
  onSaveSuccess = () => {
    profileStore.saveProfilesToLocalStorage()
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
