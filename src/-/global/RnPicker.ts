import { action, observable } from 'mobx'

export type RnPickerOption = {
  options: {
    key: number | string
    label: string
    icon?: string
  }[]
  cancelLabel?: string
  selectedKey?: string
  onSelect: Function
}

export class RnPickerStore {
  @observable currentRnPicker: RnPickerOption | null = null

  @action open = (picker: RnPickerOption) => {
    this.currentRnPicker = picker
  }
  @action dismiss = () => {
    this.currentRnPicker = null
  }
}

export default new RnPickerStore()
