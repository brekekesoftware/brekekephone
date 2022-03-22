import _ from 'lodash'
import { action, observable } from 'mobx'
import { DefaultSectionT, SectionListData } from 'react-native'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { isUcBuddy, uc } from '../api/uc'
import { getAuthStore, waitPbx } from './authStore'
import { contactStore } from './contactStore'
import { intl } from './intl'
import { profileStore } from './profileStore'

const defaultBuddyMax = 100

type BuddyType = 'PbxBuddy' | 'UcBuddy'
class UserStore {
  @observable dataGroupAllUser: SectionListData<UcBuddy>[] = []
  @observable dataListAllUser: UcBuddy[] = []
  @observable buddyMax = defaultBuddyMax
  @observable isDisableAddAllUserToTheList = false
  @observable isSelectedAddAllUser: boolean = true
  @observable selectedUserIds: { [userId: string]: boolean } = {}
  @observable saveSelectedUserIds: { [userId: string]: boolean } = {}
  @observable userOnline: { [userId: string]: string } = {}
  @observable isCapacityInvalid = false
  @observable buddyMode = 0
  @observable dataDisplayGroupAllUser: SectionListData<UcBuddy>[] = []
  type: BuddyType = 'UcBuddy'
  groups: UcBuddyGroup[] = []

  @action loadPbxBuddyList = async (isAllUser: boolean = false) => {
    await waitPbx()
    this.resetCache()
    this.type = 'PbxBuddy'
    const s = getAuthStore()
    const cp = s.currentProfile
    if (!cp) {
      return
    }
    let allUsers: UcBuddy[] = []
    // get all user from pbx
    if (isAllUser) {
      const ids = await pbx.getUsers(cp.pbxTenant)
      if (!ids) {
        return
      }
      allUsers = ids.map(u => {
        return {
          disabledBuddy: false,
          user_id: u[0],
          name: u[1],
          profile_image_url: '',
          group: '',
          tenant: cp.pbxTenant,
          block_settings: {},
          status: false,
        } as unknown as UcBuddy
      })
    }

    // get from local
    const buddyList = s.currentData?.pbxBuddyList
    const users = buddyList?.users || []
    if (s.isBigMode) {
      this.isSelectedAddAllUser = false
    } else {
      this.isSelectedAddAllUser = !!s.currentProfile?.buddyMode
    }
    this.isDisableAddAllUserToTheList = s.isBigMode
    this.buddyMax =
      Number(s.pbxConfig?.['webphone.users.max']) || defaultBuddyMax // buddy_max
    this.buddyMode = 2 // buddy_mode
    this.groups = []
    this.filterDataUserGroup(users, allUsers, this.buddyMode === 1)
  }
  @action loadUcBuddyList = async (isAllUser: boolean = false) => {
    await waitPbx()
    const s = getAuthStore()
    this.resetCache()
    this.type = 'UcBuddy'
    const userList = uc.client.getBuddylist()
    const configProperties = uc.client.getConfigProperties()
    const profile = uc.client.getProfile()
    let allUsers: UcBuddy[] = []
    if (isAllUser) {
      allUsers = uc.client
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
    }

    if (s.isBigMode) {
      this.isSelectedAddAllUser = false
    } else {
      this.isSelectedAddAllUser = !!s.currentProfile?.buddyMode
    }
    this.isDisableAddAllUserToTheList =
      s.isBigMode ||
      configProperties.optional_config?.buddy_max < allUsers?.length
    this.buddyMax =
      configProperties.optional_config?.buddy_max || defaultBuddyMax
    this.buddyMode = configProperties.buddy_mode
    this.groups = []
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
    const selectedUserIds: { [userId: string]: boolean } = {}
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
          selectedUserIds[user.user_id] = true
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

    if (!isDisableEditGroup) {
      sectionDataOther.data = [...sectionDataOther.data, ...listUserNotSelected]
      sectionData.push(sectionDataOther)
    } else if (sectionData.length > 0) {
      sectionData[0].data = [...sectionData[0].data, ...listUserNotSelected]
    }

    this.dataGroupAllUser = sectionData
    this.dataListAllUser = [...listDataUser, ...listUserNotSelected]
    this.selectedUserIds = selectedUserIds
    this.saveSelectedUserIds = _.cloneDeep(this.selectedUserIds)
    this.dataDisplayGroupAllUser = _.cloneDeep(this.dataGroupAllUser)
  }

  filterUser = (searchTxt: string, isOnline: boolean) => {
    const displayUsers: SectionListData<UcBuddy, DefaultSectionT>[] = []
    let totalContact = 0
    let totalOnlineContact = 0

    this.dataDisplayGroupAllUser.forEach(s => {
      // list all user
      const dataAllUsers =
        s.data
          ?.filter(u => this.saveSelectedUserIds[u.user_id])
          .map(u => ({ ...u, status: this.userOnline[u.user_id] })) || []

      totalContact += dataAllUsers.length

      const dataAllUsersFiltered =
        dataAllUsers?.filter(
          u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
        ) || []

      // list online user
      const dataOnlineUser = s.data
        .filter(u => this.userOnline[u.user_id])
        .map(u => ({ ...u, status: this.userOnline[u.user_id] }))
      totalOnlineContact += dataOnlineUser.length
      const dataOnlineUserFiltered = dataOnlineUser.filter(
        u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
      )
      const isNoGroup = s.title === `(${intl`No Group`})`
      if (isNoGroup && dataAllUsersFiltered.length === 0) {
        return
      }
      displayUsers.push({
        title: !isNoGroup ? s.title : '',
        data: isOnline ? dataAllUsersFiltered : dataOnlineUserFiltered,
      })
    })
    return { displayUsers, totalContact, totalOnlineContact }
  }

  @action toggleIsSelectedAddAllUser = () => {
    if (!this.isSelectedAddAllUser && !contactStore.pbxUsers.length) {
      contactStore.getPbxUsers()
    }
    this.isSelectedAddAllUser = !this.isSelectedAddAllUser
    const s = getAuthStore()
    profileStore.upsertProfile({
      id: s.currentProfile?.id,
      buddyMode: this.isSelectedAddAllUser,
    })
  }

  @observable isSelectEditGroupingAndUserOrder: boolean = false
  @action toggleIsSelectEditGroupingAndUserOrder = () => {
    this.isSelectEditGroupingAndUserOrder =
      !this.isSelectEditGroupingAndUserOrder
  }

  @action selectUserId = (userId: string) => {
    if (this.selectedUserIds[userId]) {
      delete this.selectedUserIds[userId]
    } else {
      this.selectedUserIds[userId] = true
    }
    this.isCapacityInvalid =
      Object.keys(this.selectedUserIds).length > this.buddyMax
  }

  @action selectAllUserIdsByGroup = (groupIndex: number) => {
    this.dataGroupAllUser[groupIndex]?.data.forEach(u => {
      this.selectedUserIds[u.user_id] = true
    })
  }

  @action removeGroup = (groupIndex: number) => {
    this.dataGroupAllUser[groupIndex].data.forEach(u => {
      delete this.selectedUserIds[u.user_id]
    })
    if (this.groups.length >= 1) {
      this.groups.splice(groupIndex, 1)
    }
    if (this.dataGroupAllUser.length >= 1) {
      this.dataGroupAllUser.splice(groupIndex, 1)
    }
  }

  @action unselectAllUserIdsByGroup = (groupIndex: number) => {
    this.dataGroupAllUser[groupIndex].data.forEach(u => {
      delete this.selectedUserIds[u.user_id]
    })
  }

  @action updateStatusBuddy = (buddy_id: string, status: string) => {
    if (status !== 'offline') {
      if (this.userOnline[buddy_id]) {
        return
      }
      this.userOnline[buddy_id] = status
    } else {
      delete this.userOnline[buddy_id]
    }
  }

  @action addGroup = (groupName: string, selectedUsers: UcBuddy[]) => {
    const cloneDataListAllUser = _.cloneDeep(this.dataListAllUser)
    const cloneDataGroupAllUser = _.cloneDeep(this.dataGroupAllUser)

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
    selectedUsers.forEach(u => {
      this.selectedUserIds[u.user_id] = true
    })
    this.groups.push({ id: groupName, name: groupName })
  }
  resetCache = () => {
    this.dataGroupAllUser = []
    this.groups = []
    this.selectedUserIds = {}
    this.dataListAllUser = []
    // this.byIds = {}
  }
  @action updateDisplayGroupList = () => {
    this.saveSelectedUserIds = _.cloneDeep(this.selectedUserIds)
    this.dataDisplayGroupAllUser = _.cloneDeep(this.dataGroupAllUser)
    // reset dataGroupAllUser
    this.resetCache()
  }
  @action editGroup = (
    groupName: string,
    selectedUsers: UcBuddy[],
    removedUsers: UcBuddy[],
  ) => {
    const cloneDataListAllUser = _.cloneDeep(this.dataListAllUser)
    const cloneDataGroupAllUser = _.cloneDeep(this.dataGroupAllUser)

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
    this.dataListAllUser = cloneDataListAllUser
    removedUsers.forEach(u => {
      delete this.selectedUserIds[u.user_id]
    })
    selectedUsers.forEach(u => {
      this.selectedUserIds[u.user_id] = true
    })
  }

  @action clearStore = () => {
    this.groups = []
    this.dataGroupAllUser = []
    this.dataListAllUser = []
    this.selectedUserIds = {}
    this.saveSelectedUserIds = {}
    this.dataDisplayGroupAllUser = []
  }
}

export const userStore = new UserStore()
