// eslint-disable-next-line simple-import-sort/imports
import React, { Component, Fragment } from 'react'
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import { Layout } from '../components/Layout'
import { RnIcon } from '../components/RnIcon'
import { SelectionItem } from '../components/SelectionItem'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'

import { mdiMoreHoriz, mdiMenuDown, mdiMenuLeft } from '../assets/icons'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { Dropdown } from '../components/Dropdown'
import { DropdownItemProps } from '../components/DropdownItem'

import { userStore } from '../stores/userStore'
import {
  DropdownPosition,
  RnDropdownSectionList,
} from '../stores/RnDropdownSectionList'
import { observer } from 'mobx-react'
import { UcBuddy } from '../api/brekekejs'
import { uc } from '../api/uc'
import { RnAlert } from '../stores/RnAlert'
import { v } from '../components/variables'

const css = StyleSheet.create({
  headerSectionList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'gray',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: '#333',
  },
  rightSection: {
    flexDirection: 'row',
  },
  itemWrapper: {
    borderBottomColor: v.borderBg,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  listHeaderSection: {
    paddingHorizontal: 10,
  },
  listTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
})

@observer
export class PageEditUserList extends Component {
  private sectionHeaderRefs: View[] = []
  private reCalculatedLayoutDropdownTimeoutId = 0

  componentDidUpdate() {
    if (RnDropdownSectionList.isShouldUpdateDropdownPosition) {
      RnDropdownSectionList.setIsShouldUpdateDropdownPosition(false)
      this.calculateSectionHeaderPosition()
    }
  }

  calculateSectionHeaderPosition = () => {
    if (this.reCalculatedLayoutDropdownTimeoutId) {
      this.clearConnectTimeoutId()
    }

    this.reCalculatedLayoutDropdownTimeoutId = BackgroundTimer.setTimeout(
      () => {
        // Must wrap in setTimeout to make sure
        // the header view has completed render
        const listDropdownYPosition: DropdownPosition[] = []
        this.sectionHeaderRefs.forEach((ref: View, index) => {
          if (ref) {
            ref.measure((fx, fy, w, h, px, py) => {
              listDropdownYPosition.push({ top: py + h, right: 20 })

              // after get all section list dropdown position
              if (index === this.sectionHeaderRefs.length - 1) {
                RnDropdownSectionList.setDropdownPosition(listDropdownYPosition)
              }
            })
          }
        })
      },
      300,
    )
  }

  private clearConnectTimeoutId = () => {
    if (this.reCalculatedLayoutDropdownTimeoutId) {
      BackgroundTimer.clearTimeout(this.reCalculatedLayoutDropdownTimeoutId)
      this.reCalculatedLayoutDropdownTimeoutId = 0
    }
  }

  renderHeaderSection = (
    title: string,
    data: readonly UcBuddy[],
    index: number,
  ) => {
    const selectedItemCount = userStore.isSelectedAddAllUser
      ? data.length
      : data.filter(item =>
          userStore.selectedUserIds.some(itm => itm === item.user_id),
        ).length
    const isHidden = RnDropdownSectionList.hiddenGroupIndex.some(
      idx => idx === index,
    )

    return (
      <View
        style={css.headerSectionList}
        ref={c => {
          if (c) {
            this.sectionHeaderRefs[index] = c
          }
        }}
      >
        <Text
          style={css.headerTitle}
        >{`${title} ${selectedItemCount}/${data.length}`}</Text>
        <View style={css.rightSection}>
          <TouchableOpacity
            onPress={() => RnDropdownSectionList.setDropdown(index)}
          >
            <RnIcon path={mdiMoreHoriz} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => RnDropdownSectionList.toggleSection(index)}
          >
            <RnIcon path={isHidden ? mdiMenuLeft : mdiMenuDown} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderItemUser = (item: UcBuddy, index: number) => {
    const isHidden = RnDropdownSectionList.hiddenGroupIndex.some(
      idx => idx === index,
    )
    return !isHidden ? (
      <View style={css.itemWrapper}>
        <SelectionItem
          isSelected={
            userStore.isSelectedAddAllUser ||
            userStore.selectedUserIds.some(itm => itm === item.user_id)
          }
          onPress={() => userStore.selectUserId(item.user_id)}
          title={item.name || item.user_id}
          disabled={userStore.isSelectedAddAllUser}
        />
      </View>
    ) : (
      <View />
    )
  }

  renderItemListUser = (item: UcBuddy) => {
    return (
      <View style={css.itemWrapper}>
        <SelectionItem
          isSelected={
            userStore.isSelectedAddAllUser ||
            userStore.selectedUserIds.some(itm => itm === item.user_id)
          }
          onPress={() => userStore.selectUserId(item.user_id)}
          title={item.name || item.user_id}
          disabled={userStore.isSelectedAddAllUser}
        />
      </View>
    )
  }

  getDDOptions = (ddIndex: number): DropdownItemProps[] => {
    return [
      {
        title: intl`Add/Remove user`,
        onPress: () => this.onAddRemoveUser(ddIndex),
      },
      { title: intl`Check all`, onPress: () => this.onCheckAll(ddIndex) },
      { title: intl`Uncheck all`, onPress: () => this.onUncheckAll(ddIndex) },
      { title: intl`Remove group`, onPress: () => this.onRemoveGroup(ddIndex) },
    ]
  }

  onAddRemoveUser = (ddIndex: number) => {
    console.warn('onAddRemoveUser', ddIndex)
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
      dataGroupAllUser,
      dataListAllUser,
      isSelectedAddAllUser,
      selectedUserIds,
      isDisableAddAllUserToTheList,
      isDisableGroupEditGrouping,
      isSelectEditGroupingAndUserOrder,
      isCapacityInvalid,
    } = userStore
    const { listDropdownYPosition, dropdownOpenedIndex } = RnDropdownSectionList

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
          <SelectionItem
            isSelected={isSelectEditGroupingAndUserOrder}
            onPress={this.onSelectEditGroupingAndUserOrderOption}
            title={
              isDisableGroupEditGrouping
                ? intl`Display with grouping`
                : intl`Edit grouping and user order`
            }
          />
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
        {isSelectEditGroupingAndUserOrder
          ? dataGroupAllUser.map((item, index) => (
              <Fragment>
                {this.renderHeaderSection(item.title, item.data, index)}
                {item.data.map(itemUser =>
                  this.renderItemUser(itemUser, index),
                )}
              </Fragment>
            ))
          : dataListAllUser.map(user => this.renderItemListUser(user))}
        {dropdownOpenedIndex >= 0 && (
          <Dropdown
            position={listDropdownYPosition[dropdownOpenedIndex]}
            items={this.getDDOptions(dropdownOpenedIndex)}
          />
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
    Nav().backToPageContactUsers()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save user list`,
      err,
    })
  }
}
