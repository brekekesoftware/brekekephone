// TODO:
// should not use replace string in url
// use url builder instead for safe url encoding

const pbxTokenTobeReplacedRe = /#pbx-token#/i
const langTobeReplacedRe = /#lang#/i
const tenantTobeReplacedRe = /#tenant#/i
const userTobeReplacedRe = /#user#/i
const fromNumberTobeReplacedRe = /#from-number#/i

export const replacePbxToken = (url: string, token: string) =>
  url.replace(pbxTokenTobeReplacedRe, token)

const sessParamRe = /([&?]sess=)[^&]+/i
export const replacePbxTokenUsingSessParam = (url: string, token: string) =>
  url.replace(sessParamRe, `$1${token}`)

const fromNumberParamRe = /([&?]from-number=)[^&]+/i
export const addFromNumberNonce = (url: string) => {
  if (fromNumberParamRe.test(url)) {
    return url
  }
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}from-number=#from-number#`
}
export const replaceFromNumberUsingParam = (url: string, nonce: number) =>
  url.replace(fromNumberParamRe, `$1${nonce}`)

export const hasPbxTokenTobeRepalced = (url: string) =>
  pbxTokenTobeReplacedRe.test(url)
export const isCustomPageUrlBuilt = (url: string) =>
  ![
    pbxTokenTobeReplacedRe,
    langTobeReplacedRe,
    tenantTobeReplacedRe,
    userTobeReplacedRe,
    fromNumberTobeReplacedRe,
  ].some(re => re.test(url))

export const replaceUrlWithoutPbxToken = (
  url: string,
  lang: string,
  tenant: string,
  user: string,
) =>
  url
    .replace(langTobeReplacedRe, lang)
    .replace(tenantTobeReplacedRe, tenant)
    .replace(userTobeReplacedRe, user)
    .replace(fromNumberTobeReplacedRe, '0')
