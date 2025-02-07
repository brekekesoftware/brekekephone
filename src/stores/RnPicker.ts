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
  onDismiss?: Function
}

export class RnPickerStore {
  @observable currentRnPicker: RnPickerOption | null = null

  @action open = (picker: RnPickerOption) => {
    this.currentRnPicker = picker
  }
  @action dismiss = () => {
    this.currentRnPicker?.onDismiss?.()
    this.currentRnPicker = null
  }
}

export const RnPicker = new RnPickerStore()
