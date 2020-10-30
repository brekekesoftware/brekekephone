import { observable } from 'mobx'

export type PickerOption = {
  options: {
    key: number | string
    label: string
    icon?: string
  }[]
  cancelLabel?: string
  selectedKey?: string
  onSelect: Function
}

export class PickerStore {
  @observable currentPicker: PickerOption | null = null

  open = (picker: PickerOption) => {
    this.currentPicker = picker
  }
  dismiss = () => {
    this.currentPicker = null
  }
}

export default new PickerStore()
