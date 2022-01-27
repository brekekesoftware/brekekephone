// eslint-disable-next-line simple-import-sort/imports
import React, { Component, Fragment } from 'react'
import {
  SectionListData,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'

import { Layout } from '../components/Layout'
import { RnIcon } from '../components/RnIcon'
import { SelectionItem } from '../components/SelectionItem'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

import { mdiMoreHoriz, mdiMenuDown, mdiMenuLeft } from '../assets/icons'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { Dropdown } from '../components/Dropdown'
import { DropdownItemProps } from '../components/DropdownItem'
import { uniq } from 'lodash'

const mockData = [
  {
    id: 'group1',
    name: 'group1',
    group: '',
  },
  {
    id: 'group2',
    name: 'group2',
    group: '',
  },
  {
    id: 'group3',
    name: 'group3',
    group: '',
  },
  {
    id: 'group4',
    name: 'group4',
    group: '',
  },
  {
    user_id: '1001',
    tenant: 'tenant1',
    name: 'n1001',
    group: 'group1',
  },
  {
    user_id: '1002',
    tenant: 'tenant1',
    name: 'n1002',
    group: 'group1',
  },
  {
    user_id: '2001',
    tenant: 'tenant1',
    name: 'n2001',
    group: 'group2',
  },
  {
    user_id: '2002',
    tenant: 'tenant1',
    name: 'n2002',
    group: 'group2',
  },
  {
    user_id: '9998',
    tenant: 'tenant1',
    name: 'n9998',
    group: '',
  },
  {
    user_id: '9999',
    tenant: 'tenant1',
    name: 'n9999',
    group: '',
  },
  {
    user_id: '99991',
    tenant: 'tenant11',
    name: 'n99991',
    group: 'group3',
  },
  {
    user_id: '99992',
    tenant: 'tenant12',
    name: 'n99992',
    group: 'group3',
  },
  {
    user_id: '99993',
    tenant: 'tenant11',
    name: 'n99993',
    group: 'group4',
  },
  {
    user_id: '99994',
    tenant: 'tenant12',
    name: 'n99994',
    group: 'group4',
  },
]

type UserGroup = {
  user_id: string
  tenant: string
  name: string
  group: string
}

type Group = {
  id: string
  name: string
  group: string
}

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
    borderBottomColor: '#333',
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

interface IState {
  name: string
  dataGroupUser: SectionListData<UserGroup>[]
  dataListUser: UserGroup[]
  isSelectedAddAllUser: boolean
  isSelectEditGroupingAndUserOrder: boolean
  selectedUserIds: string[]
  hiddenGroupTitle: string[]
  dropdownYPosition: number[]
  dropdownOpendedIndex: number[]
}
interface IProps {}

export class PageEditUserList extends Component<IProps, IState> {
  state: IState = {
    name: '',
    dataGroupUser: [],
    dataListUser: [],
    isSelectedAddAllUser: false,
    isSelectEditGroupingAndUserOrder: false,
    selectedUserIds: [],
    hiddenGroupTitle: [],
    dropdownYPosition: [],
    dropdownOpendedIndex: [],
  }
  private sectionHeaderRefs: View[] = []
  private reCalculatedLayoutDropdownTimeoutId = 0

  componentDidMount() {
    this.setState({
      dataGroupUser: this.transformDataGroupUser(mockData),
      dataListUser: this.transformDataListUser(mockData),
    })
  }

  componentDidUpdate(_: IProps, prevState: IState) {
    const { isSelectEditGroupingAndUserOrder, hiddenGroupTitle } = this.state
    if (
      (!prevState.isSelectEditGroupingAndUserOrder &&
        isSelectEditGroupingAndUserOrder) ||
      prevState.hiddenGroupTitle !== hiddenGroupTitle
    ) {
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
        const listDropdownYPosition: number[] = []
        this.sectionHeaderRefs.forEach((ref: View) => {
          if (ref) {
            ref.measure((fx, fy, w, h, px, py) => {
              listDropdownYPosition.push(py + h)
            })
          }
        })
        this.setState({
          dropdownYPosition: listDropdownYPosition,
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

  isUserGroup(object: any): object is UserGroup {
    return 'user_id' in object && 'group' in object
  }

  transformDataGroupUser = (dataGroupUser: (UserGroup | Group)[]) => {
    const sectionData: SectionListData<UserGroup>[] = []
    const sectionDataOther: SectionListData<UserGroup> = {
      title: 'Other',
      data: [],
    }
    if (dataGroupUser.length > 0) {
      dataGroupUser.forEach(itm => {
        if (this.isUserGroup(itm)) {
          const indx = sectionData.findIndex(
            sectionItm => sectionItm.title === itm.group,
          )
          if (indx !== -1) {
            sectionData[indx].data = [...sectionData[indx].data, itm]
          } else {
            sectionDataOther.data = [...sectionDataOther.data, itm]
          }
        } else {
          sectionData.push({ title: itm.id, data: [] })
        }
      })
    }
    sectionData.push(sectionDataOther)
    return sectionData
  }

  transformDataListUser = (
    dataGroupUser: (UserGroup | Group)[],
  ): UserGroup[] => {
    const data: UserGroup[] = []
    dataGroupUser.forEach(itm => {
      if (this.isUserGroup(itm)) {
        data.push(itm)
      }
    })
    return data
  }

  toggleSection = (title: string) => {
    const cloneHiddenGroupTitle = [...this.state.hiddenGroupTitle]
    const indexSection = cloneHiddenGroupTitle.indexOf(title)
    if (indexSection > -1) {
      cloneHiddenGroupTitle.splice(indexSection, 1)
    } else {
      cloneHiddenGroupTitle.push(title)
    }
    this.setState({
      hiddenGroupTitle: cloneHiddenGroupTitle,
      dropdownOpendedIndex: [],
    })
  }

  toggleItemSelect = (userId: string) => {
    const cloneData = [...this.state.selectedUserIds]
    const indexSelectedUser = cloneData.indexOf(userId)
    if (indexSelectedUser > -1) {
      cloneData.splice(indexSelectedUser, 1)
    } else {
      cloneData.push(userId)
    }

    this.setState({
      selectedUserIds: cloneData,
    })
  }

  renderHeaderSection = (title: string, data: readonly UserGroup[]) => {
    const {
      selectedUserIds,
      dataGroupUser,
      dropdownOpendedIndex,
      hiddenGroupTitle,
      isSelectedAddAllUser,
    } = this.state
    const selectedItemCount = isSelectedAddAllUser
      ? data.length
      : data.filter(item => selectedUserIds.some(itm => itm === item.user_id))
          .length
    const index = dataGroupUser.findIndex(itm => itm.title === title)
    const isHidden = hiddenGroupTitle.some(t => t === title)

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
          {!isHidden && (
            <TouchableOpacity
              onPress={() => {
                const indexDropdownOpended = dropdownOpendedIndex.findIndex(
                  itm => itm === index,
                )
                this.setState({
                  dropdownOpendedIndex:
                    indexDropdownOpended >= 0
                      ? dropdownOpendedIndex.filter(idx => idx !== index)
                      : [...dropdownOpendedIndex, index],
                })
              }}
            >
              <RnIcon path={mdiMoreHoriz} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => this.toggleSection(title)}>
            <RnIcon path={isHidden ? mdiMenuLeft : mdiMenuDown} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderItemUser = (item: UserGroup, title: string) => {
    const { hiddenGroupTitle, selectedUserIds, isSelectedAddAllUser } =
      this.state
    const isHidden = hiddenGroupTitle.some(itm => itm === title)
    return !isHidden ? (
      <View style={css.itemWrapper}>
        <SelectionItem
          isSelected={
            isSelectedAddAllUser ||
            selectedUserIds.some(itm => itm === item.user_id)
          }
          onPress={() => this.toggleItemSelect(item.user_id)}
          title={item.name}
          disabled={isSelectedAddAllUser}
        />
      </View>
    ) : (
      <View />
    )
  }

  renderItemListUser = (item: UserGroup) => {
    const { isSelectedAddAllUser, selectedUserIds } = this.state
    return (
      <View style={css.itemWrapper}>
        <SelectionItem
          isSelected={
            isSelectedAddAllUser ||
            selectedUserIds.some(itm => itm === item.user_id)
          }
          onPress={() => this.toggleItemSelect(item.user_id)}
          title={item.name}
          disabled={isSelectedAddAllUser}
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

  onCheckAll = (ddIndex: number) => {
    const { dataGroupUser, selectedUserIds, dropdownOpendedIndex } = this.state
    const listUserIdGroup = dataGroupUser[ddIndex].data.map(itm => itm.user_id)
    this.setState({
      selectedUserIds: uniq([...selectedUserIds, ...listUserIdGroup]),
      dropdownOpendedIndex: dropdownOpendedIndex.filter(idx => idx !== ddIndex),
    })
  }

  onUncheckAll = (ddIndex: number) => {
    const { dataGroupUser, selectedUserIds, dropdownOpendedIndex } = this.state
    const listUserIdGroup = dataGroupUser[ddIndex].data.map(itm => itm.user_id)
    this.setState({
      selectedUserIds: selectedUserIds.filter(
        idSelected => !listUserIdGroup.some(userId => userId === idSelected),
      ),
      dropdownOpendedIndex: dropdownOpendedIndex.filter(idx => idx !== ddIndex),
    })
  }

  onRemoveGroup = (ddIndex: number) => {
    console.warn('onRemoveGroup', ddIndex)
  }

  onSelectEditGroupingAndUserOrderOption = () =>
    this.setState({
      isSelectEditGroupingAndUserOrder:
        !this.state.isSelectEditGroupingAndUserOrder,
      dropdownOpendedIndex: [],
    })

  onSelectAddAllUserToList = () => {
    this.setState({
      isSelectedAddAllUser: !this.state.isSelectedAddAllUser,
      dropdownOpendedIndex: [],
    })
  }

  render() {
    const {
      isSelectedAddAllUser,
      isSelectEditGroupingAndUserOrder,
      dropdownYPosition,
      dropdownOpendedIndex,
      dataListUser,
      dataGroupUser,
      selectedUserIds,
    } = this.state

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
          />
          <SelectionItem
            isSelected={isSelectEditGroupingAndUserOrder}
            onPress={this.onSelectEditGroupingAndUserOrderOption}
            title={intl`Edit grouping and user order`}
          />
          <View style={css.listTitleSection}>
            <Text>{intl`User list`}</Text>
            <Text>{`${intl`Capacity`}   ${selectedUserIds.length}/${
              dataListUser.length
            }`}</Text>
          </View>
        </View>
        {isSelectEditGroupingAndUserOrder
          ? dataGroupUser.map(item => (
              <Fragment>
                {this.renderHeaderSection(item.title, item.data)}
                {item.data.map(itemUser =>
                  this.renderItemUser(itemUser, item.title),
                )}
              </Fragment>
            ))
          : dataListUser.map(user => this.renderItemListUser(user))}
        {dropdownOpendedIndex.map(dropdownIndex => (
          <Dropdown
            position={{ top: dropdownYPosition[dropdownIndex], right: 20 }}
            items={this.getDDOptions(dropdownIndex)}
          />
        ))}
      </Layout>
    )
  }

  save = () => {}
  onSaveSuccess = () => {}
  onSaveFailure = () => {}
}
