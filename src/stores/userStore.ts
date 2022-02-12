import { uniq, uniqBy } from 'lodash'
import { action, computed, observable } from 'mobx'
import { DefaultSectionT, SectionListData } from 'react-native'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { isUcBuddy, uc } from '../api/uc'
import { intl } from './intl'

class UserStore {
  @observable dataGroupUserIds: SectionListData<string>[] = []
  @observable dataGroupAllUser: SectionListData<UcBuddy>[] = []
  @observable dataListAllUser: UcBuddy[] = []
  @observable buddyMax: number = 0
  @observable isDisableAddAllUserToTheList: boolean = false
  @observable selectedUserIds: string[] = []
  @observable isCapacityInvalid: boolean = false
  @observable byIds: any = {} // dictionary object by id
  @observable buddyMode: number = 0
  listGroup: UcBuddyGroup[] = []
  private listStatus?: [
    {
      id: string
      status: string
    },
  ]

  @action loadGroupUser = () => {
    const userList = uc.client.getBuddylist()
    const configProperties = uc.client.getConfigProperties()
    const profile = uc.client.getProfile()
    const allUsers: UcBuddy[] = uc.client
      .getAllUsers()
      .user?.filter(u => !u.disabledBuddy && u.user_id !== profile.user_id)
      .map(
        user =>
          ({
            user_id: user.user_id,
            name: user.user_name,
            group: configProperties.buddy_mode === 1 ? user.user_group : '',
            tenant: profile.tenant,
          } as UcBuddy),
      )

    this.isSelectedAddAllUser = !userList.screened
    this.isDisableAddAllUserToTheList =
      configProperties.optional_config?.buddy_max < allUsers.length
    this.buddyMax = configProperties.optional_config?.buddy_max
    this.buddyMode = configProperties.buddy_mode
    this.listGroup = []

    this.filterDataUserGroup(
      userList.user,
      allUsers,
      configProperties.buddy_mode === 1,
    )
  }

  @action filterDataUserGroup = (
    dataGroupUser: (UcBuddy | UcBuddyGroup)[],
    listAllUser: UcBuddy[],
    isDisableEditGroup: boolean,
  ) => {
    const sectionData: SectionListData<UcBuddy>[] = []
    const sectionDataOther: SectionListData<UcBuddy> = {
      title: `(${intl`No Group`})`,
      data: [],
    }
    const sectionDataIds: SectionListData<string>[] = []
    const sectionDataOtherIds: SectionListData<string> = {
      title: `(${intl`No Group`})`,
      data: [],
    }
    const listDataUser: UcBuddy[] = []
    const selectedUserIds: string[] = []
    let byIds: any = {} // dictionary object by id

    if (dataGroupUser.length > 0) {
      dataGroupUser.forEach(itm => {
        if (isUcBuddy(itm)) {
          const indx = sectionData.findIndex(
            sectionItm => sectionItm.title === itm.group,
          )
          if (indx !== -1) {
            sectionData[indx].data = [...sectionData[indx].data, itm]
            sectionDataIds[indx].data = [
              ...sectionDataIds[indx].data,
              itm.user_id,
            ]
          } else {
            sectionDataOther.data = [...sectionDataOther.data, itm]
            sectionDataOtherIds.data = [
              ...sectionDataOtherIds.data,
              itm.user_id,
            ]
          }
          listDataUser.push(itm)
          selectedUserIds.push(itm.user_id)
          byIds = { ...byIds, ...{ [itm.user_id]: itm } }
        } else if (!this.listGroup.some(g => g.id === itm.id)) {
          sectionData.push({ title: itm.id, data: [] })
          sectionDataIds.push({ title: itm.id, data: [] })
          this.listGroup.push(itm)
        }
      })
    }
    const listUserNotSelected = listAllUser.filter(
      itm => !listDataUser.some(u => u.user_id === itm.user_id),
    )
    if (this.listStatus && this.listStatus.length > 0) {
      this.listStatus.forEach(itm => {
        if (byIds[itm.id]) {
          byIds[itm.id].status = itm.status
        }
      })
    }
    this.byIds = byIds
    if (!isDisableEditGroup) {
      sectionDataOther.data = [...sectionDataOther.data, ...listUserNotSelected]
      this.dataGroupUserIds = [...sectionDataIds, sectionDataOtherIds]
      sectionData.push(sectionDataOther)
    } else if (sectionData.length > 0) {
      sectionData[0].data = [...sectionData[0].data, ...listUserNotSelected]
      this.dataGroupUserIds = [...sectionDataIds]
    }

    this.dataGroupAllUser = sectionData
    this.dataListAllUser = [...listDataUser, ...listUserNotSelected]
    this.selectedUserIds = selectedUserIds
  }

  @observable isSelectedAddAllUser: boolean = false
  @action toggleIsSelectedAddAllUser = () => {
    this.isSelectedAddAllUser = !this.isSelectedAddAllUser
  }

  @observable isSelectEditGroupingAndUserOrder: boolean = false
  @action toggleIsSelectEditGroupingAndUserOrder = () => {
    this.isSelectEditGroupingAndUserOrder =
      !this.isSelectEditGroupingAndUserOrder
  }

  @action selectUserId = (userId: string) => {
    const indexSelectedUser = this.selectedUserIds.indexOf(userId)
    if (indexSelectedUser > -1) {
      this.selectedUserIds.splice(indexSelectedUser, 1)
    } else {
      this.selectedUserIds.push(userId)
    }
    this.isCapacityInvalid = this.selectedUserIds.length > this.buddyMax
  }

  @action selectedAllUserIdsByGroup = (groupIndex: number) => {
    this.selectedUserIds = uniq([
      ...this.selectedUserIds,
      ...this.dataGroupAllUser[groupIndex].data.map(itm => itm.user_id),
    ])
  }

  @action removeGroup = (groupIndex: number) => {
    const dataRemove = [...this.dataGroupAllUser[groupIndex]?.data]
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]
    cloneDataGroupAllUser.splice(groupIndex, 1)

    if (dataRemove.length > 0) {
      dataRemove.forEach(itm => {
        cloneDataGroupAllUser[cloneDataGroupAllUser.length - 1].data = [
          ...cloneDataGroupAllUser[cloneDataGroupAllUser.length - 1].data,
          itm,
        ]
      })
    }

    console.log('this.selectedUserIds', this.selectedUserIds, dataRemove)
    this.listGroup.splice(groupIndex, 1)
    this.dataGroupUserIds.splice(groupIndex, 1)
    this.dataGroupAllUser = cloneDataGroupAllUser
    this.selectedUserIds = this.selectedUserIds.filter(
      i => !dataRemove.some(u => u.user_id === i),
    )
  }

  @action deSelectedAllUserIdsByGroup = (groupIndex: number) => {
    this.selectedUserIds = this.selectedUserIds.filter(
      id =>
        !this.dataGroupAllUser[groupIndex].data
          .map(itm => itm.user_id)
          .some(userId => userId === id),
    )
  }

  @action updateStatusBuddy = (buddy_id: string, status: string) => {
    if (this.byIds[buddy_id]) {
      this.byIds[buddy_id].status = status
    }
    if (!this.listStatus) {
      this.listStatus = [{ id: buddy_id, status }]
    } else {
      this.listStatus.push({ id: buddy_id, status })
    }
  }

  @action addGroup = (groupName: string, selectedIds: string[]) => {
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]

    this.dataGroupAllUser.forEach((group, index) => {
      cloneDataGroupAllUser[index].data = group.data.filter(
        item => !selectedIds.some(id => id === item.user_id),
      )
    })

    const newGroupContact: SectionListData<UcBuddy, DefaultSectionT> = {
      data: this.dataListAllUser.filter(itm =>
        selectedIds.some(id => id === itm.user_id),
      ),
      title: groupName,
    }

    cloneDataGroupAllUser.unshift(newGroupContact)
    this.dataGroupAllUser = cloneDataGroupAllUser
    this.selectedUserIds = uniq([...this.selectedUserIds, ...selectedIds])
  }

  @action editGroup = (groupName: string, selectedIds: string[]) => {
    // this.selectedUserIds = uniq([...this.selectedUserIds, ...selectedIds])
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]

    this.dataGroupAllUser.forEach((group, index) => {
      if (group.title === groupName) {
        cloneDataGroupAllUser[index].data = this.dataListAllUser.filter(u =>
          selectedIds.some(id => u.user_id === id),
        )
      } else {
        cloneDataGroupAllUser[index].data = group.data.filter(
          item => !selectedIds.some(id => id === item.user_id),
        )
      }
    })

    // const cloneDataListAllUser = [...this.dataListAllUser]

    // const listItemUnSelected = originalListItem.filter(
    //   itm => !selectedIds.some(id => id === itm.user_id),
    // )

    // this.dataListAllUser.forEach((item, index) => {
    //   if (selectedIds.some(id => id === item.user_id)) {
    //     cloneDataListAllUser[index].group = groupName
    //   }
    // })

    // this.dataGroupAllUser.forEach((group, index) => {
    //   if (group.title === groupName) {
    //     cloneDataGroupAllUser[index].data = uniqBy(
    //       [
    //         ...cloneDataListAllUser.filter(u =>
    //           selectedIds.some(id => u.user_id === id),
    //         ),
    //         ...originalListItem,
    //       ],
    //       'user_id',
    //     )
    //   } else {
    //     cloneDataGroupAllUser[index].data = group.data.filter(
    //       u => !selectedIds.some(id => u.user_id === id),
    //     )
    //   }
    // })

    this.dataGroupAllUser = cloneDataGroupAllUser
    this.selectedUserIds = uniq([...this.selectedUserIds, ...selectedIds])
  }

  @action clearStore = () => {
    this.listGroup = []
    this.dataGroupAllUser = []
    this.dataListAllUser = []
    this.selectedUserIds = []
  }
}

export const userStore = new UserStore()
