import { uniq, uniqBy } from 'lodash'
import { action, observable } from 'mobx'
import { SectionListData } from 'react-native'

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

export type UserGroup = {
  user_id: string
  tenant: string
  name: string
  group: string
}

export type Group = {
  id: string
  name: string
  group: string
}

class UserStore {
  @observable dataGroupUser: SectionListData<UserGroup>[] = []
  isUserGroup(object: any): object is UserGroup {
    return 'user_id' in object && 'group' in object
  }

  @action loadGroupUser = async () => {
    this.transformDataListUser(mockData as (UserGroup | Group)[])
    this.transformDataGroupUser(mockData as (UserGroup | Group)[])
  }

  @action transformDataGroupUser = (dataGroupUser: (UserGroup | Group)[]) => {
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
    this.dataGroupUser = uniqBy(sectionData, 'title')
  }

  @observable dataListUser: UserGroup[] = []
  @action transformDataListUser = (dataGroupUser: (UserGroup | Group)[]) => {
    const data: UserGroup[] = []
    dataGroupUser.forEach(itm => {
      if (this.isUserGroup(itm)) {
        data.push(itm)
      }
    })
    this.dataListUser = uniqBy(data, 'user_id')
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

  @observable selectedUserIds: string[] = []
  @action selectUserId = (userId: string) => {
    const cloneUserIds = [...userStore.selectedUserIds]
    const indexSelectedUser = cloneUserIds.indexOf(userId)
    if (indexSelectedUser > -1) {
      cloneUserIds.splice(indexSelectedUser, 1)
    } else {
      cloneUserIds.push(userId)
    }
    this.selectedUserIds = cloneUserIds
  }

  @action selectedAllUserIdsByGroup = (groupIndex: number) => {
    this.selectedUserIds = uniq([
      ...this.selectedUserIds,
      ...this.dataGroupUser[groupIndex].data.map(itm => itm.user_id),
    ])
  }

  @action deSelectedAllUserIdsByGroup = (groupIndex: number) => {
    this.selectedUserIds = this.selectedUserIds.filter(
      id =>
        !userStore.dataGroupUser[groupIndex].data
          .map(itm => itm.user_id)
          .some(userId => userId === id),
    )
  }
}

export const userStore = new UserStore()
