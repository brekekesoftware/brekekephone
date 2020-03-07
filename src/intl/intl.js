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
  const arr = labels[g.locale];
  const i = enLabelsMapIndex[k];
  //
  let compileFn = null;
  if (g.locale !== `en`) {
    compileFn = arr[i];
  }
  if (!compileFn) {
    return k;
  }
  //
  if (typeof compileFn !== `function`) {
    compileFn = Handlebars.compile(k);
    arr[i] = compileFn;
  }
  const l = compileFn(data);
  // Add en label so we can tracked later
  // TODO not used anywhere yet
  l.en = k;
  return l;
};

g.initLocale();

export default intl;
