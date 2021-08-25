import { action, computed, observable, runInAction } from 'mobx'

import en from '../assets/intl-en.json'
import ja from '../assets/intl-ja.json'
import vi from '../assets/intl-vi.json'
import { RnAsyncStorage } from '../components/Rn'
import { IncomingCall } from '../utils/RnNativeModules'
import { arrToMap } from '../utils/toMap'
import { waitTimeout } from '../utils/waitTimeout'
import { RnPicker } from './RnPicker'

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
  { key: 'ja', label: '日本語' },
  // { key: 'vi', label: 'Tiếng Việt' },
]

export class IntlStore {
  @observable locale = 'en'
  @observable localeReady = false
  @observable localeLoading = true
  @computed get localeName() {
    return localeOptions.find(o => o.key === this.locale)?.label
  }

  private getLocaleFromLocalStorage = async () => {
    let locale = await RnAsyncStorage.getItem('locale')
    if (!locale || !labels[locale as 'en']) {
      locale = 'en'
      await RnAsyncStorage.setItem('locale', locale)
    }
    runInAction(() => {
      this.locale = locale || 'en'
      IncomingCall.setLocale(this.locale)
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
      this.localeLoading = false
      this.locale = locale
      IncomingCall.setLocale(this.locale)
    })
  }
  selectLocale = () => {
    RnPicker.open({
      options: localeOptions,
      selectedKey: this.locale,
      onSelect: this.setLocale,
    })
  }
  loadingPromise = this.getLocaleFromLocalStorage().then(
    action(() => {
      this.localeReady = true
      this.localeLoading = false
    }),
  )
}
export const intlStore = new IntlStore() as Immutable<IntlStore>
