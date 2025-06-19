import RnAsyncStorage from '@react-native-async-storage/async-storage'
import { action, observable, runInAction } from 'mobx'
import { NativeModules } from 'react-native'

// import vi from '#/assets/intl-vi.json'
import en from '#/assets/intl-en.json'
import ja from '#/assets/intl-ja.json'
import { isIos } from '#/config'
import { ctx } from '#/stores/ctx'
import { RnPicker } from '#/stores/RnPicker'
import { arrToMap } from '#/utils/arrToMap'
import { BrekekeUtils } from '#/utils/RnNativeModules'
import { waitTimeout } from '#/utils/waitTimeout'

export const labels = {
  en,
  ja,
  // vi,
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

// typings
const TypedNativeModules = NativeModules as {
  SettingsManager?: {
    settings?: {
      AppleLocale?: string
      AppleLanguages?: string[]
    }
  }
  I18nManager?: {
    localeIdentifier?: string
  }
}

export class IntlStore {
  @observable locale = 'en'
  @observable localeReady = false
  @observable localeLoading = true
  getLocaleName = () => localeOptions.find(o => o.key === this.locale)?.label

  private getLocale = async () => {
    let locale = await RnAsyncStorage.getItem('locale').then(l => l || '')
    if (!locale || !labels[locale]) {
      locale =
        (isIos
          ? TypedNativeModules?.SettingsManager?.settings?.AppleLocale ||
            TypedNativeModules?.SettingsManager?.settings?.AppleLanguages?.[0]
          : TypedNativeModules?.I18nManager?.localeIdentifier) || ''
      locale = locale?.substr(0, 2)
      console.log(`Intl debug: system locale=${locale}`)
    }
    if (!locale || !labels[locale]) {
      locale = 'en'
    }
    await RnAsyncStorage.setItem('locale', locale)
    runInAction(() => {
      this.locale = locale
      BrekekeUtils.setLocale(this.locale)
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
      BrekekeUtils.setLocale(this.locale)
    })
  }
  selectLocale = () => {
    RnPicker.open({
      options: localeOptions,
      selectedKey: this.locale,
      onSelect: this.setLocale,
    })
  }

  private loadingPromise?: Promise<unknown>
  wait = () => {
    if (!this.loadingPromise) {
      this.loadingPromise = this.getLocale().then(
        action(() => {
          this.localeReady = true
          this.localeLoading = false
        }),
      )
    }
    return this.loadingPromise
  }
}
ctx.intl = new IntlStore()
