import { computed, observable, runInAction } from 'mobx'

import RnPicker from '../global/RnPicker'
import { RnAsyncStorage } from '../Rn'
import { arrToMap } from '../utils/toMap'
import waitTimeout from '../utils/waitTimeout'
import en from './en.json'
import ja from './ja.json'
import vi from './vi.json'

export const labels = {
  en,
  ja,
  vi,
}
export const enLabelsMapIndex = arrToMap(
  en,
  k => k,
  (_, i) => i,
)

export const localeOptions = [
  { key: 'en', label: 'English' },
  // { key: 'ja', label: '日本語' },
  // { key: 'vi', label: 'Tiếng Việt' },
]

export class IntlStore {
  @observable locale = 'en'
  @observable localeReady = false
  @observable localeLoading = true
  @computed get localeName() {
    return localeOptions.find(o => o.key === this.locale)?.label
  }

  initLocale = async () => {
    await this.getLocaleFromLocalStorage()
    runInAction(() => {
      this.localeReady = true
      this.localeLoading = false
    })
  }
  private getLocaleFromLocalStorage = async () => {
    let locale = await RnAsyncStorage.getItem('locale')
    if (!locale || !labels[locale]) {
      locale = 'en'
      await RnAsyncStorage.setItem('locale', locale)
    }
    runInAction(() => {
      this.locale = locale || 'en'
    })
  }
  private setLocale = async locale => {
    if (this.localeLoading || locale === this.locale) {
      return
    }
    runInAction(() => {
      this.localeLoading = true
    })
    if (!labels[locale]) {
      locale = 'en'
    }
    await RnAsyncStorage.setItem('locale', locale)
    await waitTimeout()
    runInAction(() => {
      this.locale = locale
      this.localeLoading = false
    })
  }
  selectLocale = () => {
    RnPicker.open({
      options: localeOptions,
      selectedKey: this.locale,
      onSelect: this.setLocale,
    })
  }
}
export default new IntlStore()
