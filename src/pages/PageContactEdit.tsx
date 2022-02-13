// eslint-disable-next-line simple-import-sort/imports
import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
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

const css = StyleSheet.create({
  listHeaderSection: {
    paddingHorizontal: 10,
  },
  listTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowGroupTitle: { flexDirection: 'row', justifyContent: 'space-between' },
  rowCapacity: { flexDirection: 'row', alignItems: 'center' },
  errorText: { color: 'red' },
})

@observer
export class PageContactEdit extends Component {
  componentDidMount() {
    userStore.loadGroupUser()
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
        onPress: () => this.onCheckAll(ddIndex),
        disabled:
          userStore.isSelectedAddAllUser ||
          userStore.dataGroupAllUser[ddIndex]?.data?.length === 0,
      },
      {
        title: intl`Uncheck all`,
        onPress: () => this.onUncheckAll(ddIndex),
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
    userStore.selectedAllUserIdsByGroup(groupIndex)
  }

  onUncheckAll = (groupIndex: number) => {
    RnDropdownSectionList.closeDropdown()
    userStore.deSelectedAllUserIdsByGroup(groupIndex)
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
    userStore.clearStore()
    userStore.loadGroupUser()
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
        title={intl`Edit the user list`}
        containerRef={this.setViewRef}
      >
        <TouchableWithoutFeedback onPress={RnDropdownSectionList.closeDropdown}>
          <View style={css.listHeaderSection}>
            <SelectionItem
              isSelected={isSelectedAddAllUser}
              onPress={userStore.toggleIsSelectedAddAllUser}
              title={intl`Add all user to the list`}
              disabled={isDisableAddAllUserToTheList}
            />
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
              <RnText>{intl`User list`}</RnText>
              <View style={css.rowCapacity}>
                <RnText>{`${intl`Capacity`}`}</RnText>
                <RnText style={isCapacityInvalid && css.errorText}>{`    ${
                  isSelectedAddAllUser
                    ? dataListAllUser.length
                    : selectedUserIds.length
                }`}</RnText>
                <RnText>{` / ${buddyMax}`}</RnText>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {isSelectEditGroupingAndUserOrder ? (
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

  save = () => {
    const {
      isCapacityInvalid,
      isSelectedAddAllUser,
      groups,
      dataListAllUser,
      selectedUserIds,
    } = userStore

    if (!isCapacityInvalid) {
      uc.saveProperties(!isSelectedAddAllUser, [
        ...groups,
        ...dataListAllUser.filter(
          user =>
            selectedUserIds.some(id => id === user.user_id) ||
            isSelectedAddAllUser,
        ),
      ])
        .then(this.onSaveSuccess)
        .catch(this.onSaveFailure)
    }
  }
  onSaveSuccess = () => {
    this.onGoBack()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save user list`,
      err,
    })
  }
}
