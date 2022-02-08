import { uniq } from 'lodash'
import { action, observable } from 'mobx'

export type RnDropdownSectionListOption = {}

export type DropdownPosition = {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export class RnDropdownSectionListStore {
  @observable groupIndex: number[] = []
  @observable hiddenGroupIndex: number[] = []
  @observable listDropdownYPosition: DropdownPosition[] = []
  @observable dropdownOpenedIndex: number = -1
  @observable isShouldUpdateDropdownPosition: boolean = false

  @action setHiddenGroupIndex = (groupsIndex: number[]) => {
    this.hiddenGroupIndex = groupsIndex
  }

  @action toggleSection = (index: number) => {
    const cloneHiddenGroupIndex = [...this.hiddenGroupIndex]
    const indexSectionInHiddenGroup = cloneHiddenGroupIndex.indexOf(index)
    if (indexSectionInHiddenGroup > -1) {
      cloneHiddenGroupIndex.splice(indexSectionInHiddenGroup, 1)
    } else {
      cloneHiddenGroupIndex.push(index)
    }

    this.isShouldUpdateDropdownPosition = true
    this.dropdownOpenedIndex = -1
    this.hiddenGroupIndex = uniq(cloneHiddenGroupIndex)
  }

  @action setDropdownPosition = (position: DropdownPosition[]) => {
    this.listDropdownYPosition = position
  }

  @action setDropdownOpenedIndex = (index: number) => {
    this.dropdownOpenedIndex = index
  }

  @action setDropdown = (index: number) => {
    this.dropdownOpenedIndex = index === this.dropdownOpenedIndex ? -1 : index
  }

  @action closeDropdown = () => {
    this.dropdownOpenedIndex = -1
  }

  @action setIsShouldUpdateDropdownPosition = (isShould: boolean) => {
    this.isShouldUpdateDropdownPosition = isShould
  }
}

export const RnDropdownSectionList = new RnDropdownSectionListStore()
