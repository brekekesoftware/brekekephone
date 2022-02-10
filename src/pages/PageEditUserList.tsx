// eslint-disable-next-line simple-import-sort/imports
import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'

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
})

@observer
export class PageEditUserList extends Component {
  getDDOptions = (ddIndex: number): DropdownItemProps[] => {
    console.log('')
    return [
      {
        title: intl`Add/Remove user`,
        onPress: () => this.onAddRemoveUser(ddIndex),
      },
      { title: intl`Check all`, onPress: () => this.onCheckAll(ddIndex) },
      { title: intl`Uncheck all`, onPress: () => this.onUncheckAll(ddIndex) },
      {
        title: intl`Remove group`,
        onPress: () => this.onRemoveGroup(ddIndex),
        disabled: userStore.dataGroupAllUser[ddIndex]?.data?.length > 0,
      },
    ]
  }

  onAddRemoveUser = (ddIndex: number) => {
    console.warn('onAddRemoveUser', ddIndex)
    RnDropdownSectionList.closeDropdown()
  }

  onCheckAll = (groupIndex: number) => {
    userStore.selectedAllUserIdsByGroup(groupIndex)
    RnDropdownSectionList.closeDropdown()
  }

  onUncheckAll = (groupIndex: number) => {
    userStore.deSelectedAllUserIdsByGroup(groupIndex)
    RnDropdownSectionList.closeDropdown()
  }

  onRemoveGroup = (ddIndex: number) => {
    console.warn('onRemoveGroup', ddIndex)
    userStore.removeGroup(ddIndex)
    RnDropdownSectionList.closeDropdown()
  }

  onSelectEditGroupingAndUserOrderOption = () => {
    if (!userStore.isSelectEditGroupingAndUserOrder) {
      RnDropdownSectionList.setIsShouldUpdateDropdownPosition(true)
    }
    userStore.toggleIsSelectEditGroupingAndUserOrder()
    RnDropdownSectionList.closeDropdown()
  }

  onSelectAddAllUserToList = () => {
    userStore.toggleIsSelectedAddAllUser()
    RnDropdownSectionList.closeDropdown()
  }

  render() {
    const {
      buddyMax,
      dataListAllUser,
      isSelectedAddAllUser,
      selectedUserIds,
      isDisableAddAllUserToTheList,
      isDisableGroupEditGrouping,
      isSelectEditGroupingAndUserOrder,
      isCapacityInvalid,
      dataGroupAllUser,
    } = userStore
    const { dropdownOpenedIndex } = RnDropdownSectionList
    return (
      <Layout
        fabOnBack={Nav().backToPageContactUsers}
        fabOnNext={this.save}
        fabOnNextText={intl`SAVE`}
        onBack={Nav().backToPageContactUsers}
        title={intl`Edit the user list`}
      >
        <View style={css.listHeaderSection}>
          <SelectionItem
            isSelected={isSelectedAddAllUser}
            onPress={this.onSelectAddAllUserToList}
            title={intl`Add all user to the list`}
            disabled={isDisableAddAllUserToTheList}
          />
          <View style={css.rowGroupTitle}>
            <SelectionItem
              isSelected={isSelectEditGroupingAndUserOrder}
              onPress={this.onSelectEditGroupingAndUserOrderOption}
              title={
                isDisableGroupEditGrouping
                  ? intl`Display with grouping`
                  : intl`Edit grouping and user order`
              }
            />
            <RnTouchableOpacity>
              <RnIcon path={mdiFolderPlus} />
            </RnTouchableOpacity>
          </View>
          <View style={css.listTitleSection}>
            <Text>{intl`User list`}</Text>
            <Text>
              {`${intl`Capacity`}`}
              <Text style={isCapacityInvalid && { color: 'red' }}>
                {`    ${
                  isSelectedAddAllUser
                    ? dataListAllUser.length
                    : selectedUserIds.length
                }`}
              </Text>
              {` / ${buddyMax}`}
            </Text>
          </View>
        </View>
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
      listGroup,
      dataListAllUser,
      selectedUserIds,
    } = userStore

    if (!isCapacityInvalid) {
      uc.saveProperties(!isSelectedAddAllUser, [
        ...listGroup,
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
    userStore.clearStore()
    userStore.loadGroupUser()
    Nav().backToPageContactUsers()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save user list`,
      err,
    })
  }
}
