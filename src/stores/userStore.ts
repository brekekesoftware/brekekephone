import { cloneDeep } from 'lodash'
import { action, observable } from 'mobx'
import type { SectionListData } from 'react-native'

import { isUcBuddy } from '#/api/uc'
import type { UcBuddy, UcBuddyGroup } from '#/brekekejs'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

const defaultBuddyMax = 100

export type GroupUserSectionListData = SectionListData<
  UcBuddy,
  { title: string }
>
export type BuddyType = 'PbxBuddy' | 'UcBuddy'

export class UserStore {
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
    await ctx.auth.waitPbx()
    this.resetCache()
    this.type = 'PbxBuddy'
    const ca = ctx.auth.getCurrentAccount()
    if (!ca) {
      return
    }
    let allUsers: UcBuddy[] = []
    // get all user from pbx
    if (isAllUser) {
      const ids = await ctx.pbx.getUsers(ca.pbxTenant)
      if (!ids) {
        return
      }
      allUsers = ids
        .filter(u => u[0] !== ca.pbxUsername)
        .map(
          u =>
            ({
              disabledBuddy: false,
              user_id: u[0],
              name: u[1],
              profile_image_url: '',
              group: '',
              tenant: ca.pbxTenant,
              block_settings: {},
              status: false,
            }) as any as UcBuddy,
        )
    }

    // get from local
    const d = await ctx.auth.getCurrentDataAsync()
    const buddyList = d?.pbxBuddyList
    const users = cloneDeep(buddyList?.users || [])

    if (ctx.auth.isBigMode()) {
      this.isSelectedAddAllUser = false
    } else {
      this.isSelectedAddAllUser =
        !!ctx.auth.getCurrentAccount()?.pbxLocalAllUsers
    }
    this.isDisableAddAllUserToTheList = ctx.auth.isBigMode()
    this.buddyMax =
      Number(ctx.auth.pbxConfig?.['webphone.users.max']) || defaultBuddyMax // buddy_max
    this.buddyMode = 2 // buddy_mode
    this.groups = []
    this.filterDataUserGroup(users, allUsers, this.buddyMode === 1)
  }
  @action loadUcBuddyList = async (isAllUser: boolean = false) => {
    await ctx.auth.waitUc()
    if (ctx.auth.ucState !== 'success') {
      return
    }
    this.resetCache()
    this.type = 'UcBuddy'
    const userList = ctx.uc.client.getBuddylist()
    const configProperties = ctx.uc.client.getConfigProperties()
    const p = ctx.uc.client.getProfile()
    let allUsers: UcBuddy[] = []
    if (isAllUser) {
      allUsers = ctx.uc.client
        .getAllUsers()
        .user?.filter(u => !u.disabledBuddy && u.user_id !== p.user_id)
        .map(
          user =>
            ({
              user_id: user.user_id,
              name: user.user_name,
              group: configProperties.buddy_mode === 1 ? user.user_group : '',
              tenant: p.tenant,
            }) as UcBuddy,
        )
    }
    if (ctx.auth.isBigMode()) {
      this.isSelectedAddAllUser = false
    } else {
      this.isSelectedAddAllUser =
        !!ctx.auth.getCurrentAccount()?.pbxLocalAllUsers
    }
    this.isDisableAddAllUserToTheList =
      ctx.auth.isBigMode() ||
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

  @action getBuddyById = (buddy_id: string) =>
    this.dataListAllUser.find(item => item.user_id === buddy_id)

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
    this.saveSelectedUserIds = cloneDeep(this.selectedUserIds)
    this.dataDisplayGroupAllUser = cloneDeep(this.dataGroupAllUser)
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
    if (!this.isSelectedAddAllUser && !ctx.contact.pbxUsers.length) {
      ctx.contact.getPbxUsers()
    }
    this.isSelectedAddAllUser = !this.isSelectedAddAllUser
    ctx.account.upsertAccount({
      id: ctx.auth.getCurrentAccount()?.id,
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
    if (!ctx.auth.getCurrentAccount()?.ucEnabled) {
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
      data: Object.keys(selectedUsers).map(key => selectedUsers[key]),
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
    this.saveSelectedUserIds = cloneDeep(this.selectedUserIds)
    this.dataDisplayGroupAllUser = cloneDeep(this.dataGroupAllUser)
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
          key => selectedUserItems[key],
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

ctx.user = new UserStore()
