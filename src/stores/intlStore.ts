import { computed, observable, runInAction } from 'mobx'

import en from '../assets/intl-en.json'
import ja from '../assets/intl-ja.json'
import vi from '../assets/intl-vi.json'
import { RnAsyncStorage } from '../components/Rn'
import { arrToMap } from '../utils/toMap'
import waitTimeout from '../utils/waitTimeout'
import RnPicker from './RnPicker'

export const labels = {
  en,
  ja,
  vi,
} as { [k: string]: string[] }
export const enLabelsMapIndex = arrToMap(
  en,
  (k: string) => k,
  (k: string, i: number) => i,
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
    if (!locale || !labels[locale as 'en']) {
      locale = 'en'
      await RnAsyncStorage.setItem('locale', locale)
    }
    runInAction(() => {
      this.locale = locale || 'en'
    })
  }
  private setLocale = async (locale: string) => {
    if (this.localeLoading || locale === this.locale) {
      return
    }
    runInAction(() => {
      this.localeLoading = true
    })
    if (!labels[locale as 'en']) {
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
