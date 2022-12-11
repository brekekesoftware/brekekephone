import _ from 'lodash'
import { action, observable } from 'mobx'
import { SectionListData } from 'react-native'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { pbx } from '../api/pbx'
import { isUcBuddy, uc } from '../api/uc'
import { accountStore } from './accountStore'
import { getAuthStore, waitPbx, waitUc } from './authStore'
import { contactStore } from './contactStore'
import { intl } from './intl'

const defaultBuddyMax = 100

export type GroupUserSectionListData = SectionListData<
  UcBuddy,
  { title: string }
>
export type BuddyType = 'PbxBuddy' | 'UcBuddy'

class UserStore {
  @observable dataGroupAllUser: GroupUserSectionListData[] = []
  @observable dataListAllUser: UcBuddy[] = []
  @observable buddyMax = defaultBuddyMax
  @observable isDisableAddAllUserToTheList = false
  @observable isSelectedAddAllUser: boolean = true
  @observable selectedUserIds: { [userId: string]: boolean } = {}
  @observable saveSelectedUserIds: { [userId: string]: boolean } = {}
  @observable userOnline: { [userId: string]: string } = {}
  @observable isCapacityInvalid = false
  @observable buddyMode = 0
  @observable dataDisplayGroupAllUser: GroupUserSectionListData[] = []
  type: BuddyType = 'UcBuddy'
  groups: UcBuddyGroup[] = []

  @action loadPbxBuddyList = async (isAllUser: boolean = false) => {
    await waitPbx()
    this.resetCache()
    this.type = 'PbxBuddy'
    const s = getAuthStore()
    const cp = s.getCurrentAccount()
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
      allUsers = ids
        .filter(u => u[0] !== cp.pbxUsername)
        .map(u => {
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
    const d = await s.getCurrentDataAsync()
    const buddyList = d?.pbxBuddyList
    const users = _.cloneDeep(buddyList?.users || [])

    if (s.isBigMode()) {
      this.isSelectedAddAllUser = false
    } else {
      this.isSelectedAddAllUser = !!s.getCurrentAccount()?.pbxLocalAllUsers
    }
    this.isDisableAddAllUserToTheList = s.isBigMode()
    this.buddyMax =
      Number(s.pbxConfig?.['webphone.users.max']) || defaultBuddyMax // buddy_max
    this.buddyMode = 2 // buddy_mode
    this.groups = []
    this.filterDataUserGroup(users, allUsers, this.buddyMode === 1)
  }
  @action loadUcBuddyList = async (isAllUser: boolean = false) => {
    await waitUc()
    const s = getAuthStore()
    this.resetCache()
    this.type = 'UcBuddy'
    const userList = uc.client.getBuddylist()
    const configProperties = uc.client.getConfigProperties()
    const p = uc.client.getProfile()
    let allUsers: UcBuddy[] = []
    if (isAllUser) {
      allUsers = uc.client
        .getAllUsers()
        .user?.filter(u => !u.disabledBuddy && u.user_id !== p.user_id)
        .map(
          user =>
            ({
              user_id: user.user_id,
              name: user.user_name,
              group: configProperties.buddy_mode === 1 ? user.user_group : '',
              tenant: p.tenant,
            } as UcBuddy),
        )
    }

    if (s.isBigMode()) {
      this.isSelectedAddAllUser = false
    } else {
      this.isSelectedAddAllUser = !!s.getCurrentAccount()?.pbxLocalAllUsers
    }
    this.isDisableAddAllUserToTheList =
      s.isBigMode() ||
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

  @action getBuddyById = (buddy_id: string) => {
    return this.dataListAllUser.find(item => item.user_id === buddy_id)
  }

  @action filterDataUserGroup = (
    dataGroupUser: (UcBuddy | UcBuddyGroup)[],
    listAllUser: UcBuddy[],
    isDisableEditGroup: boolean,
  ) => {
    const sectionData: GroupUserSectionListData[] = []
    const sectionDataOther: GroupUserSectionListData = {
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
    const displayUsers: GroupUserSectionListData[] = []
    let totalContact = 0
    let totalOnlineContact = 0

    this.dataDisplayGroupAllUser.forEach(s => {
      // list all user
      const dataAllUsers =
        s.data
          ?.filter(u => this.saveSelectedUserIds[u.user_id])
          .map(u => ({ ...u, status: this.userOnline[u.user_id] })) || []

      totalContact += dataAllUsers.length

      const dataAllUsersFiltered = dataAllUsers.filter(
        u => u.user_id.includes(searchTxt) || u.name.includes(searchTxt),
      )

      // list online user
      const dataOnlineUser = s.data
        .filter(u => this.userOnline[u.user_id])
        .map(u => ({ ...u, status: this.userOnline[u.user_id] }))
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

  @action toggleIsSelectedAddAllUser = () => {
    if (!this.isSelectedAddAllUser && !contactStore.pbxUsers.length) {
      contactStore.getPbxUsers()
    }
    this.isSelectedAddAllUser = !this.isSelectedAddAllUser
    const s = getAuthStore()
    accountStore.upsertAccount({
      id: s.getCurrentAccount()?.id,
      pbxLocalAllUsers: this.isSelectedAddAllUser,
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

  getHeaderTitle = (
    sectionTitle: string,
    renderData: readonly UcBuddy[],
    isEditMode?: boolean,
  ) => {
    if (!getAuthStore().getCurrentAccount()?.ucEnabled) {
      return `(${renderData.length})`
    }

    if (isEditMode) {
      const selectedItemCount = this.isSelectedAddAllUser
        ? renderData.length
        : renderData.filter(i => this.selectedUserIds[i.user_id]).length
      return `${sectionTitle} ${selectedItemCount}/${renderData.length}`
    }

    const indexGroup = this.dataGroupAllUser.findIndex(
      item => item.title === sectionTitle,
    )
    if (indexGroup <= -1) {
      return ''
    }
    const totalUser = this.dataGroupAllUser[indexGroup].data.length
    const totalOnline = this.dataGroupAllUser[indexGroup].data.filter(
      u => this.userOnline[u.user_id],
    ).length
    return `${
      sectionTitle === `(${intl`No Group`})` ? '' : sectionTitle
    } ${totalOnline}/${totalUser}`
  }

  @action updateStatusBuddy = (
    buddy_id: string,
    status: string,
    avatar: string,
  ) => {
    if (status !== 'offline') {
      this.userOnline[buddy_id] = status
    } else {
      delete this.userOnline[buddy_id]
    }
  }

  @action addGroup = (
    groupName: string,
    selectedUsers: { [k: string]: UcBuddy },
  ) => {
    this.dataListAllUser.forEach((user, index) => {
      if (selectedUsers[user.user_id]) {
        this.dataListAllUser[index].group = groupName
      }
    })

    this.dataGroupAllUser.forEach((group, index) => {
      this.dataGroupAllUser[index].data = group.data.filter(
        item => !selectedUsers[item.user_id],
      )
    })

    const newGroupContact: GroupUserSectionListData = {
      data: Object.keys(selectedUsers).map(key => {
        return selectedUsers[key]
      }),
      title: groupName,
    }

    this.dataGroupAllUser.unshift(newGroupContact)

    Object.keys(selectedUsers).forEach(u => {
      this.selectedUserIds[u] = true
    })
    this.groups.push({ id: groupName, name: groupName })
  }
  resetCache = () => {
    this.groups = []
    this.selectedUserIds = {}
    this.dataListAllUser = []
  }
  @action updateDisplayGroupList = () => {
    this.saveSelectedUserIds = _.cloneDeep(this.selectedUserIds)
    this.dataDisplayGroupAllUser = _.cloneDeep(this.dataGroupAllUser)
    // reset dataGroupAllUser
    this.resetCache()
  }
  @action editGroup = (
    groupName: string,
    removedUsers: UcBuddy[],
    selectedUserItems: { [k: string]: UcBuddy },
  ) => {
    this.dataListAllUser.forEach((user, index) => {
      if (selectedUserItems[user.user_id]) {
        this.dataListAllUser[index].group = groupName
      }
    })

    this.dataGroupAllUser.forEach((group, index) => {
      if (group.title === groupName) {
        this.dataGroupAllUser[index].data = Object.keys(selectedUserItems).map(
          key => {
            return selectedUserItems[key]
          },
        )
      } else {
        this.dataGroupAllUser[index].data = group.data.filter(
          item => !selectedUserItems[item.user_id],
        )
      }
      if (index === this.dataGroupAllUser.length - 1) {
        this.dataGroupAllUser[index].data = [
          ...this.dataGroupAllUser[index].data,
          ...removedUsers,
        ]
      }
    })

    Object.keys(selectedUserItems).forEach(u => {
      this.selectedUserIds[u] = true
    })
    // this.selectedUserIds = _.merge(this.selectedUserIds, selectedUsersId)
    removedUsers.forEach(u => {
      delete this.selectedUserIds[u.user_id]
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
