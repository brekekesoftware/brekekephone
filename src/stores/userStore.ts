import { uniq } from 'lodash'
import { action, observable } from 'mobx'
import { DefaultSectionT, SectionListData } from 'react-native'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { isUcBuddy, uc } from '../api/uc'
import { getAuthStore } from './authStore'
import { intl } from './intl'

type BuddyType = 'PbxBuddy' | 'UcBuddy'
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

  type: BuddyType = 'UcBuddy'
  groups: UcBuddyGroup[] = []
  private userStatus?: [
    {
      id: string
      status: string
    },
  ]

  @action loadGroupPbxUser = (pbxUsers: UcBuddy[]) => {
    this.type = 'PbxBuddy'
    // get user from pbx
    const allUsers: UcBuddy[] = pbxUsers
    // get from local
    const buddyList = getAuthStore().currentData?.pbxBuddyList
    const users = buddyList?.users || allUsers

    this.isSelectedAddAllUser = buddyList?.screened || true // !userList.screened
    this.isDisableAddAllUserToTheList = 200 < allUsers?.length // limit set default 200
    this.buddyMax = 200 // buddy_max
    this.buddyMode = 2 // buddy_mode
    this.groups = []

    if (allUsers?.length > 0) {
      this.filterDataUserGroup(users, allUsers, this.buddyMode === 1)
    }
  }
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
      configProperties.optional_config?.buddy_max < allUsers?.length
    this.buddyMax = configProperties.optional_config?.buddy_max
    this.buddyMode = configProperties.buddy_mode
    this.groups = []
    if (allUsers?.length > 0) {
      this.filterDataUserGroup(
        userList.user,
        allUsers,
        configProperties.buddy_mode === 1,
      )
    }
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
      dataGroupUser.forEach(user => {
        if (isUcBuddy(user)) {
          const indx = sectionData.findIndex(
            sectionItm => sectionItm.title === user.group,
          )
          if (indx !== -1) {
            sectionData[indx].data = [...sectionData[indx].data, user]
            sectionDataIds[indx].data = [
              ...sectionDataIds[indx].data,
              user.user_id,
            ]
          } else {
            sectionDataOther.data = [...sectionDataOther.data, user]
            sectionDataOtherIds.data = [
              ...sectionDataOtherIds.data,
              user.user_id,
            ]
          }
          listDataUser.push(user)
          selectedUserIds.push(user.user_id)
          byIds = { ...byIds, ...{ [user.user_id]: user } }
        } else if (!this.groups.some(g => g.id === user.id)) {
          sectionData.push({ title: user.id, data: [] })
          sectionDataIds.push({ title: user.id, data: [] })
          this.groups.push(user)
        }
      })
    }
    const listUserNotSelected = listAllUser.filter(
      itm => !listDataUser.some(u => u.user_id === itm.user_id),
    )
    if (this.userStatus && this.userStatus.length > 0) {
      this.userStatus.forEach(status => {
        if (byIds[status.id]) {
          byIds[status.id].status = status.status
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

  filterUser = (searchTxt: string, isOnline: boolean) => {
    const displayUsers: SectionListData<UcBuddy, DefaultSectionT>[] = []
    let totalContact = 0
    let totalOnlineContact = 0
    this.dataGroupAllUser.forEach(s => {
      // list all user
      const dataAllUsers = s.data?.filter(u => this.byIds[u.user_id]) || []
      totalContact += dataAllUsers.length

      const dataAllUsersFiltered =
        dataAllUsers?.filter(
          u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
        ) || []
      // list online user
      const dataOnlineUser = s.data
        .map(i =>
          this.byIds[i.user_id]?.status === 'online'
            ? this.byIds[i.user_id]
            : null,
        )
        .filter(u => u)
      totalOnlineContact += dataOnlineUser.length
      const dataOnlineUserFiltered = dataOnlineUser.filter(
        u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
      )

      displayUsers.push({
        title: s.title,
        data: isOnline ? dataAllUsersFiltered : dataOnlineUserFiltered,
      })
    })
    return { displayUsers, totalContact, totalOnlineContact }
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
    const removedUsers = [...this.dataGroupAllUser[groupIndex]?.data]
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]
    cloneDataGroupAllUser.splice(groupIndex, 1)

    if (removedUsers.length > 0) {
      removedUsers.forEach(itm => {
        cloneDataGroupAllUser[cloneDataGroupAllUser.length - 1].data = [
          ...cloneDataGroupAllUser[cloneDataGroupAllUser.length - 1].data,
          itm,
        ]
      })
    }

    this.groups.splice(groupIndex, 1)
    this.dataGroupUserIds.splice(groupIndex, 1)
    this.dataGroupAllUser = cloneDataGroupAllUser
    this.selectedUserIds = this.selectedUserIds.filter(
      i => !removedUsers.some(user => user.user_id === i),
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
    if (!this.userStatus) {
      this.userStatus = [{ id: buddy_id, status }]
    } else {
      this.userStatus.push({ id: buddy_id, status })
    }
  }

  @action addGroup = (groupName: string, selectedUsers: UcBuddy[]) => {
    const cloneDataListAllUser = [...this.dataListAllUser]
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]

    this.dataListAllUser.forEach((user, index) => {
      if (
        selectedUsers.some(
          selectedUser => selectedUser.user_id === user.user_id,
        )
      ) {
        cloneDataListAllUser[index].group = groupName
      }
    })

    this.dataGroupAllUser.forEach((group, index) => {
      cloneDataGroupAllUser[index].data = group.data.filter(
        item =>
          !selectedUsers.some(
            selectedUser => selectedUser.user_id === item.user_id,
          ),
      )
    })

    const newGroupContact: SectionListData<UcBuddy, DefaultSectionT> = {
      data: cloneDataListAllUser.filter(itm =>
        selectedUsers.some(
          selectedUser => selectedUser.user_id === itm.user_id,
        ),
      ),
      title: groupName,
    }

    cloneDataGroupAllUser.unshift(newGroupContact)
    this.dataGroupAllUser = cloneDataGroupAllUser
    this.dataListAllUser = cloneDataListAllUser
    this.selectedUserIds = uniq([
      ...this.selectedUserIds,
      ...selectedUsers.map(selectedUser => selectedUser.user_id),
    ])
    this.groups.push({ id: groupName, name: groupName })
  }
  @action updateList = () => {
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]
    this.dataGroupAllUser.forEach((group, index) => {
      cloneDataGroupAllUser[index].data = group.data.filter(item =>
        this.selectedUserIds.some(id => item.user_id === id),
      )
    })
    this.dataGroupAllUser = cloneDataGroupAllUser
  }
  @action editGroup = (
    groupName: string,
    selectedUsers: UcBuddy[],
    removedUsers: UcBuddy[],
  ) => {
    const cloneDataListAllUser = [...this.dataListAllUser]
    const cloneDataGroupAllUser = [...this.dataGroupAllUser]

    this.dataListAllUser.forEach((user, index) => {
      if (
        selectedUsers.some(
          selectedUser => selectedUser.user_id === user.user_id,
        )
      ) {
        cloneDataListAllUser[index].group = groupName
      }
    })

    this.dataGroupAllUser.forEach((group, index) => {
      if (group.title === groupName) {
        cloneDataGroupAllUser[index].data = selectedUsers
      } else {
        cloneDataGroupAllUser[index].data = group.data.filter(
          item =>
            !selectedUsers.some(
              selectedUser => selectedUser.user_id === item.user_id,
            ),
        )
      }
      if (index === this.dataGroupAllUser.length - 1) {
        cloneDataGroupAllUser[index].data = [
          ...cloneDataGroupAllUser[index].data,
          ...removedUsers,
        ]
      }
    })

    this.dataGroupAllUser = cloneDataGroupAllUser
    this.selectedUserIds = uniq([
      ...this.selectedUserIds.filter(
        id => !removedUsers.some(u => u.user_id === id),
      ),
      ...selectedUsers.map(u => u.user_id),
    ])
  }

  @action clearStore = () => {
    this.groups = []
    this.dataGroupAllUser = []
    this.dataListAllUser = []
    this.selectedUserIds = []
  }
}

export const userStore = new UserStore()
