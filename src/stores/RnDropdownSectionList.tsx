import _, { uniq } from 'lodash'
import { action, observable } from 'mobx'

export type RnDropdownSectionListOption = {}

export type DropdownPosition = {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export class RnDropdownSectionListStore {
  @observable hiddenGroupIndex: number[] = []
  @observable listDropdownPosition: DropdownPosition[] = []
  @observable dropdownOpenedIndex: number = -1
  @observable isShouldUpdateDropdownPosition: boolean = false
  itemHeight: number = 0
  headerHeight: number = 0

  @action setHiddenGroupIndex = (groupsIndex: number[]) => {
    this.hiddenGroupIndex = groupsIndex
  }

  @action setHeaderHeight = (height: number) => {
    this.headerHeight = height
  }

  @action setItemHeight = (height: number) => {
    this.itemHeight = height
  }

  @action removeSection = (sectionIndex: number, itemSize: number) => {
    const clonePositionDD = [...this.listDropdownPosition]
    this.listDropdownPosition.forEach((pos, index) => {
      if (index > sectionIndex) {
        clonePositionDD[index] = {
          top:
            (clonePositionDD[index].top || 0) -
            this.itemHeight * itemSize -
            this.headerHeight,
          right: clonePositionDD[index].right || 0,
        }
      }
    })
    if (clonePositionDD.length >= 1) {
      clonePositionDD.splice(sectionIndex, 1)
    }
    this.listDropdownPosition = clonePositionDD
    this.hiddenGroupIndex = this.hiddenGroupIndex.map(idx => idx - 1)
    this.dropdownOpenedIndex = -1
  }

  @action toggleSection = (sectionIndex: number, itemSize: number) => {
    const cloneHiddenGroupIndex = [...this.hiddenGroupIndex]
    const indexSectionInHiddenGroup =
      cloneHiddenGroupIndex.indexOf(sectionIndex)
    if (indexSectionInHiddenGroup > -1) {
      if (cloneHiddenGroupIndex.length >= 1) {
        cloneHiddenGroupIndex.splice(indexSectionInHiddenGroup, 1)
      }
    } else {
      cloneHiddenGroupIndex.push(sectionIndex)
    }
    const isCollapse = !this.hiddenGroupIndex.some(itm => itm === sectionIndex)
    const clonePositionDD = _.cloneDeep(this.listDropdownPosition)

    this.listDropdownPosition.forEach((i, index) => {
      if (index > sectionIndex) {
        clonePositionDD[index] = {
          top:
            (clonePositionDD[index].top || 0) +
            (isCollapse ? -this.itemHeight : this.itemHeight) * itemSize,
          right: clonePositionDD[index].right || 0,
        }
      }
    })

    this.dropdownOpenedIndex = -1
    this.hiddenGroupIndex = uniq(cloneHiddenGroupIndex)
    this.listDropdownPosition = clonePositionDD
  }

  @action setDropdownPosition = (position: DropdownPosition[]) => {
    this.listDropdownPosition = position
  }

  @action setDropdownOpenedIndex = (index: number) => {
    this.dropdownOpenedIndex = index
  }

  @action setDropdown = (index: number) => {
    this.dropdownOpenedIndex = index === this.dropdownOpenedIndex ? -1 : index
    this.hiddenGroupIndex = this.hiddenGroupIndex.filter(idx => idx !== index)
  }

  @action closeDropdown = () => {
    this.dropdownOpenedIndex = -1
  }

  @action addSection = () => {
    this.hiddenGroupIndex = this.hiddenGroupIndex.map(idx => idx + 1)
    this.isShouldUpdateDropdownPosition = true
  }

  @action setIsShouldUpdateDropdownPosition = (isShould: boolean) => {
    this.isShouldUpdateDropdownPosition = isShould
  }
}

export const RnDropdownSectionList = new RnDropdownSectionListStore()
