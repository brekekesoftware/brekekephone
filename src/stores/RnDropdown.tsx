import { cloneDeep, uniq } from 'lodash'
import { action, observable } from 'mobx'

export type DropdownPosition = {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export class RnDropdownStore {
  @observable positions: DropdownPosition[] = []
  @observable shouldUpdatePosition: boolean = false
  @observable hiddenIndexes: number[] = []
  @observable openedIndex: number = -1
  itemHeight: number = 0
  headerHeight: number = 0

  @action toggleSection = (sectionIndex: number, itemSize: number) => {
    //
    const hiddenIndexes2 = [...this.hiddenIndexes]
    const ii = hiddenIndexes2.indexOf(sectionIndex)
    if (ii > -1) {
      hiddenIndexes2.splice(ii, 1)
    } else {
      hiddenIndexes2.push(sectionIndex)
    }
    //
    const positions2 = cloneDeep(this.positions)
    const collapse = !this.hiddenIndexes.some(i => i === sectionIndex)
    this.positions.forEach((i, index) => {
      if (index > sectionIndex) {
        positions2[index] = {
          top:
            (positions2[index].top || 0) +
            (collapse ? -this.itemHeight : this.itemHeight) * itemSize,
          right: positions2[index].right || 0,
        }
      }
    })
    //
    this.openedIndex = -1
    this.hiddenIndexes = uniq(hiddenIndexes2)
    this.positions = positions2
  }
  @action removeSection = (sectionIndex: number, itemSize: number) => {
    const positions2 = [...this.positions]
    this.positions.forEach((_, index) => {
      if (index > sectionIndex) {
        positions2[index] = {
          top:
            (positions2[index].top || 0) -
            this.itemHeight * itemSize -
            this.headerHeight,
          right: positions2[index].right || 0,
        }
      }
    })
    if (positions2.length >= 1) {
      positions2.splice(sectionIndex, 1)
    }
    this.positions = positions2
    this.hiddenIndexes = this.hiddenIndexes.map(idx => idx - 1)
    this.openedIndex = -1
  }

  @action setPositions = (positions: DropdownPosition[]) => {
    this.positions = positions
  }
  @action setShouldUpdatePosition = (v: boolean) => {
    this.shouldUpdatePosition = v
  }

  @action open = (index: number) => {
    this.openedIndex = index
  }
  @action toggle = (index: number) => {
    this.openedIndex = index === this.openedIndex ? -1 : index
    this.hiddenIndexes = this.hiddenIndexes.filter(i => i !== index)
  }
  @action close = () => {
    this.openedIndex = -1
  }

  @action setHiddenIndexes = (indexes: number[]) => {
    this.hiddenIndexes = indexes
  }
  @action addSection = () => {
    this.hiddenIndexes = this.hiddenIndexes.map(i => i + 1)
    this.shouldUpdatePosition = true
  }

  @action setHeaderHeight = (height: number) => {
    this.headerHeight = height
  }
  @action setItemHeight = (height: number) => {
    this.itemHeight = height
  }
}

export const RnDropdown = new RnDropdownStore()
