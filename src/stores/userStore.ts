import { uniq } from 'lodash'
import { action, observable } from 'mobx'
import { SectionListData } from 'react-native'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { uc } from '../api/uc'

export const isUcBuddy = (object: any): object is UcBuddy => {
  return 'user_id' in object && 'group' in object
}

class UserStore {
  @observable dataGroupUserIds: SectionListData<string>[] = []
  @observable dataGroupAllUser: SectionListData<UcBuddy>[] = []
  @observable dataListAllUser: UcBuddy[] = []
  @observable buddyMax: number = 0
  @observable isDisableGroupEditGrouping: boolean = false
  @observable isDisableAddAllUserToTheList: boolean = false
  @observable selectedUserIds: string[] = []
  @observable isCapacityInvalid: boolean = false
  @observable byIds: any = {} // dictionary by id
  listGroup: UcBuddyGroup[] = []

  @action loadGroupUser = async () => {
    const userList = uc.client.getBuddylist()
    const configProperties = uc.client.getConfigProperties()
    const profile = uc.client.getProfile()
    const allUsers: UcBuddy[] = uc.client
      .getAllUsers()
      .user.filter(u => !u.disabledBuddy && u.user_id !== profile.user_id)
      .map(
        user =>
          ({
            user_id: user.user_id,
            name: user.user_name,
            group: configProperties.buddy_mode === 1 ? user.user_group : '',
            tenant: profile.tenant,
          } as UcBuddy),
      )

    console.log('allUsers', allUsers)
    this.isSelectedAddAllUser = !userList.screened
    this.isDisableGroupEditGrouping = configProperties.buddy_mode === 1
    this.isDisableAddAllUserToTheList =
      configProperties.optional_config.buddy_max < allUsers.length
    this.buddyMax = configProperties.optional_config.buddy_max

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
      title: 'Other',
      data: [],
    }
    const sectionDataIds: SectionListData<string>[] = []
    const sectionDataOtherIds: SectionListData<string> = {
      title: 'Other',
      data: [],
    }
    const listDataUser: UcBuddy[] = []
    const selectedUserIds: string[] = []
    let byIds = {}

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
    this.byIds = byIds
    this.dataGroupUserIds = [...sectionDataIds, sectionDataOtherIds]
    if (!isDisableEditGroup) {
      sectionDataOther.data = [...sectionDataOther.data, ...listUserNotSelected]
      sectionData.push(sectionDataOther)
    } else if (sectionData.length > 0) {
      sectionData[0].data = [...sectionData[0].data, ...listUserNotSelected]
    }
    this.dataGroupAllUser = sectionData
    this.dataListAllUser = [...listDataUser, ...listUserNotSelected]
    this.selectedUserIds = selectedUserIds
  }

  @observable isSelectedAddAllUser: boolean = false
  @action toggleIsSelectedAddAllUser = () => {
    this.isSelectedAddAllUser = !this.isSelectedAddAllUser
  }

  @action getBuddyByIds = (idBuddy: string): UcBuddy => {
    return this.byIds[idBuddy]
  }

  @observable isSelectEditGroupingAndUserOrder: boolean = false
  @action toggleIsSelectEditGroupingAndUserOrder = () => {
    this.isSelectEditGroupingAndUserOrder =
      !this.isSelectEditGroupingAndUserOrder
  }

  @action selectUserId = (userId: string) => {
    const cloneUserIds = [...userStore.selectedUserIds]
    const indexSelectedUser = cloneUserIds.indexOf(userId)
    if (indexSelectedUser > -1) {
      cloneUserIds.splice(indexSelectedUser, 1)
    } else {
      cloneUserIds.push(userId)
    }
    this.isCapacityInvalid = cloneUserIds.length > this.buddyMax
    this.selectedUserIds = cloneUserIds
  }

  @action selectedAllUserIdsByGroup = (groupIndex: number) => {
    this.selectedUserIds = uniq([
      ...this.selectedUserIds,
      ...this.dataGroupAllUser[groupIndex].data.map(itm => itm.user_id),
    ])
  }

  @action removeGroup = (groupIndex: number) => {
    console.log('remove group', groupIndex, this.dataGroupAllUser)
    this.dataGroupAllUser.splice(groupIndex, 1)
    this.listGroup.splice(groupIndex, 1)
    this.dataGroupUserIds.splice(groupIndex, 1)
  }

  @action deSelectedAllUserIdsByGroup = (groupIndex: number) => {
    this.selectedUserIds = this.selectedUserIds.filter(
      id =>
        !userStore.dataGroupAllUser[groupIndex].data
          .map(itm => itm.user_id)
          .some(userId => userId === id),
    )
  }

  @action updateStatusBuddy = (buddy_id: string, status: string) => {
    if (this.byIds[buddy_id]) {
      this.byIds[buddy_id].status = status
    }
  }

  @action clearStore = () => {
    this.listGroup = []
    this.dataGroupAllUser = []
    this.dataListAllUser = []
    this.selectedUserIds = []
  }
}

export const userStore = new UserStore()
