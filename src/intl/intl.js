import Handlebars from 'handlebars/dist/handlebars';
import HandlebarsMoment from 'helper-moment';

import { AsyncStorage } from '../-/Rn';
import g from '../global/_';
import { arrToMap } from '../utils/toMap';
import waitTimeout from '../utils/waitTimeout';
import en from './en.json';
import ja from './ja.json';
import vi from './vi.json';

Handlebars.registerHelper(`moment`, HandlebarsMoment);

const labels = {
  en,
  ja,
  vi,
};
const enLabelsMapIndex = arrToMap(
  en,
  k => k,
  (k, i) => i,
);

const localeOptions = [
  { key: `en`, label: `English` },
  { key: `ja`, label: `日本語` },
  { key: `vi`, label: `Tiếng Việt` },
];

g.extends({
  observable: {
    locale: `en`,
    localeReady: false,
    localeLoading: true,
    get localeName() {
      return localeOptions.find(o => o.key === g.locale).label;
    },
  },
  initLocale: async () => {
    await g.getLocaleFromLocalStorage();
    g.localeReady = true;
    g.localeLoading = false;
  },
  getLocaleFromLocalStorage: async () => {
    let locale = await AsyncStorage.getItem(`locale`);
    if (!labels[locale]) {
      locale = `en`;
      await AsyncStorage.setItem(`locale`, locale);
    }
    g.locale = locale;
  },
  setLocale: async locale => {
    if (g.localeLoading || locale === g.locale) {
      return;
    }
    g.localeLoading = true;
    if (!labels[locale]) {
      locale = `en`;
    }
    await AsyncStorage.setItem(`locale`, locale);
    await waitTimeout();
    g.locale = locale;
    g.localeLoading = false;
  },
  selectLocale: () => {
    g.openPicker({
      options: localeOptions,
      selectedKey: g.locale,
      onSelect: g.setLocale,
    });
  },
});

const intl = (k, data) => {
  const i = enLabelsMapIndex[k];
  //
  let enFn = labels.en[i];
  if (!enFn || typeof enFn !== `function`) {
    enFn = Handlebars.compile(k);
  }
  if (i !== undefined) {
    labels.en[i] = enFn; // Cache
  }
  //
  let fn = enFn;
  if (g.locale !== `en`) {
    fn = labels[g.locale][i];
    if (!fn) {
      fn = () => `Untranslated`;
    }
    if (typeof fn !== `function`) {
      fn = Handlebars.compile(fn);
    }
    if (i !== undefined) {
      labels[g.locale][i] = fn; // Cache
    }
  }
  // Add English label to log/debug in showError using intl property
  // In order to assign intl property to string we must use the String object
  // eslint-disable-next-line no-new-wrappers
  const l = new String(fn(data));
  l.intl = enFn(data);
  return l;
};

g.initLocale();

export default intl;
