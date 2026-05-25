import { action, makeAutoObservable, observable } from 'mobx'

export type RnPickerOption = {
  options: {
    key: number | string
    label: string
    icon?: string
  }[]
  cancelLabel?: string
  confirmLabel?: string
  selectedKey?: string
  onSelect: Function
  onDismiss?: Function
  onConfirm?: Function
}

export class RnPickerStore {
  constructor() {
    makeAutoObservable(this)
  }
  currentRnPicker: RnPickerOption | null = null

  open = (picker: RnPickerOption) => {
    this.currentRnPicker = picker
  }
  dismiss = () => {
    this.currentRnPicker?.onDismiss?.()
    this.currentRnPicker = null
  }
}

export const RnPicker = new RnPickerStore()
