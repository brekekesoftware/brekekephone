import { random } from 'lodash'
import validator from 'validator'

import { PbxCustomPage } from '../brekekejs'
import { getAuthStore } from '../stores/authStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { pbx } from './pbx'

// TODO
// should not use replace string in url
// use url builder instead for safe url encoding

const _buildCustomPageUrl = async (url: string) => {
  const { token } = await pbx.getPbxToken()
  if (!token) {
    return url
  }
  const ca = getAuthStore().getCurrentAccount()
  return url
    .replace(/#lang#/i, intlStore.locale)
    .replace(/#pbx-token#/i, token)
    .replace(/#tenant#'/i, ca.pbxTenant)
    .replace(/#user#/i, ca.pbxUsername)
    .replace(/#from-number#/i, '0')
}
export const buildCustomPageUrl = (url: string) =>
  _buildCustomPageUrl(url).catch(() => url)

export const isCustomPageUrlBuilt = (url: string) => !/#pbx-token#/i.test(url)

const _rebuildCustomPageUrl = async (url: string) => {
  const { token } = await pbx.getPbxToken()
  if (!token) {
    return url
  }
  url = url.replace(/&sess=[^&]+/, `&sess=${token}`)
  url = rebuildCustomPageUrlNonce(url)
  return url
}
export const rebuildCustomPageUrl = (url: string) =>
  _rebuildCustomPageUrl(url).catch(() => url)

const _addCustomPageUrlNonce = (url: string) => {
  // for refresh page by change from-number value
  const hasNonce = /#from-number#/i.test(url) || /&from-number=/.test(url)
  if (!hasNonce) {
    return url + '&from-number=#from-number#'
  }
  return url
}
export const rebuildCustomPageUrlNonce = (url: string) =>
  url.replace(/&from-number=([0-9]+)/, `&from-number=${random(1, 1000, false)}`)

export const _parseListCustomPage = () => {
  const as = getAuthStore()
  const c = as.pbxConfig
  if (!c) {
    return
  }
  const results: PbxCustomPage[] = []
  Object.keys(c).forEach(k => {
    if (!k.startsWith('webphone.custompage')) {
      return
    }
    const parts = k.split('.')
    const id = `${parts[0]}.${parts[1]}`
    if (results.some(item => item.id === id)) {
      return
    }
    let url = c[`${id}.url`]
    if (!validator.isURL(url)) {
      // ignore if not url
      return
    }
    url = _addCustomPageUrlNonce(url)
    const title = c[`${id}.title`] || intl`PBX user settings`
    const pos = c[`${id}.pos`] || 'setting,right,1'
    const incoming = c[`${id}.incoming`]
    results.push({
      id,
      url,
      title,
      pos,
      incoming,
    })
  })
  as.listCustomPage = results
}
