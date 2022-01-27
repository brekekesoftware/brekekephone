import React, { Component } from 'react'
import { SectionList, SectionListData, Text, View } from 'react-native'

import { Layout } from '../components/Layout'
import { SelectionItem } from '../components/SelectionItem'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'

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
]

type userGroup = {
  user_id: string
  tenant: string
  name: string
  group: string
}

type group = {
  id: string
  name: string
  group: string
}

export class PageEditUserList extends Component {
  state: {
    name: string
    dataGroupUser: SectionListData<userGroup>[]
    isSelectedAddAllUser: boolean
    isSelectEditGroupingAndUserOrder: boolean
  } = {
    name: '',
    dataGroupUser: [],
    isSelectedAddAllUser: false,
    isSelectEditGroupingAndUserOrder: false,
  }

  isGroup(object: any): object is group {
    return 'id' in object
  }

  transformDataGroupUser = (dataGroupUser: (userGroup | group)[]) => {
    const sectionData: SectionListData<userGroup>[] = []
    const sectionDataOther: SectionListData<userGroup> = {
      title: 'Other',
      data: [],
    }
    if (dataGroupUser.length > 0) {
      dataGroupUser.forEach(itm => {
        if (this.isGroup(itm)) {
          sectionData.push({ title: itm.id, data: [] })
        } else {
          const indx = sectionData.findIndex(
            sectionItm => sectionItm.title === itm.group,
          )
          if (indx !== -1) {
            sectionData[indx].data = [...sectionData[indx].data, itm]
          } else {
            sectionDataOther.data = [...sectionDataOther.data, itm]
          }
        }
      })
    }
    sectionData.push(sectionDataOther)
    return sectionData
  }

  componentDidMount() {
    this.setState({
      dataGroupUser: this.transformDataGroupUser(mockData),
    })
  }

  render() {
    const { isSelectedAddAllUser, isSelectEditGroupingAndUserOrder } =
      this.state

    return (
      <Layout
        fabOnBack={Nav().backToPageContactUsers}
        fabOnNext={this.save}
        fabOnNextText={intl`SAVE`}
        onBack={Nav().backToPageContactUsers}
        title={intl`Edit the user list`}
      >
        <View>
          <SelectionItem
            isSelected={isSelectedAddAllUser}
            onPress={() =>
              this.setState({
                isSelectedAddAllUser: !isSelectedAddAllUser,
              })
            }
            title={intl`Add all user to the list`}
          />
          <SelectionItem
            isSelected={isSelectEditGroupingAndUserOrder}
            onPress={() =>
              this.setState({
                isSelectEditGroupingAndUserOrder:
                  !isSelectEditGroupingAndUserOrder,
              })
            }
            title={intl`Edit grouping and user order`}
          />
          <SectionList
            sections={this.state.dataGroupUser}
            renderItem={({ item, index }) => <Text>{item.name}</Text>}
            renderSectionHeader={({ section: { title } }) => (
              <Text>{`title ${title}`}</Text>
            )}
            keyExtractor={(itm, idx) => `${itm.user_id}-${idx}`}
          />
        </View>
      </Layout>
    )
  }

  save = () => {}
  onSaveSuccess = () => {}
  onSaveFailure = () => {}
}
