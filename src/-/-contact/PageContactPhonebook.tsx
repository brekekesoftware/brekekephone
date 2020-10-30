import {
  mdiBriefcase,
  mdiCellphone,
  mdiHome,
  mdiInformation,
  mdiPhone,
} from '@mdi/js'
import orderBy from 'lodash/orderBy'
import { observer } from 'mobx-react'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import pbx from '../api/pbx'
import g from '../global'
import authStore from '../global/authStore'
import callStore from '../global/callStore'
import contactStore from '../global/contactStore'
import Nav from '../global/Nav'
import RnAlert from '../global/RnAlert'
import RnPicker from '../global/RnPicker'
import intl, { intlDebug } from '../intl/intl'
import { RnText, RnTouchableOpacity } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'
import UserItem from './UserItem'

const css = StyleSheet.create({
  Loading: {
    marginTop: 20,
  },
})

@observer
class PageContactPhonebook extends React.Component {
  componentDidMount() {
    const id = window.setInterval(() => {
      if (!pbx.client) {
        return
      }
      contactStore.loadContactsFirstTime()
      clearInterval(id)
    }, 300)
  }

  update = id => {
    const contact = contactStore.getPhonebook(id)
    if (contact?.loaded) {
      Nav.goToPagePhonebookUpdate({
        contact: contact,
      })
    } else {
      this.loadContactDetail(id, ct => {
        Nav.goToPagePhonebookUpdate({
          contact: ct,
        })
      })
    }
  }

  loadContactDetail = (id, cb) => {
    pbx
      .getContact(id)
      .then(ct => {
        Object.assign(ct, { loaded: true })
        contactStore.upsertPhonebook(ct)
        cb(ct)
      })
      .catch(err => {
        RnAlert.error({
          message: intlDebug`Failed to load contact detail for ${id}`,
          err,
        })
      })
  }

  callRequest = (number, contact) => {
    if (number !== '') {
      callStore.startCall(number.replace(/\s+/g, ''))
    } else {
      this.update(contact)
      RnAlert.error({
        message: intlDebug`This contact doesn't have any phone number`,
      })
    }
  }

  onIcon0 = u => {
    if (!u) {
      return
    }
    if (u.loaded) {
      this._onIcon0(u)
      return
    }
    this.loadContactDetail(u.id, () => {
      this._onIcon0(u)
    })
  }
  _onIcon0 = u => {
    if (!u) {
      return
    }

    if (!u.homeNumber && !u.workNumber && !u.cellNumber) {
      this.callRequest('', u)
      return
    }

    const numbers: {
      key: string
      value: string
      icon: string
    }[] = []
    if (u.workNumber !== '') {
      numbers.push({
        key: 'workNumber',
        value: u.workNumber,
        icon: mdiBriefcase,
      })
    }
    if (u.cellNumber !== '') {
      numbers.push({
        key: 'cellNumber',
        value: u.cellNumber,
        icon: mdiCellphone,
      })
    }
    if (u.homeNumber !== '') {
      numbers.push({
        key: 'homeNumber',
        value: u.homeNumber,
        icon: mdiHome,
      })
    }

    if (numbers.length === 1) {
      this.callRequest(numbers[0].value, u)
      return
    }
    RnPicker.open({
      options: numbers.map(i => ({
        key: i.value,
        label: i.value,
        icon: i.icon,
      })),
      onSelect: e => this.callRequest(e, u),
    })
  }

  render() {
    let phonebooks = contactStore.phoneBooks
    if (!authStore.currentProfile.displaySharedContacts) {
      phonebooks = phonebooks.filter(i => i.shared !== true)
    }
    const map = {}
    phonebooks.forEach(u => {
      let c0 = u.name.charAt(0).toUpperCase()
      if (!/[A-Z]/.test(c0)) {
        c0 = '#'
      }
      if (!map[c0]) {
        map[c0] = []
      }
      map[c0].push(u)
    })
    let groups = Object.keys(map).map(k => ({
      key: k,
      phonebooks: map[k],
    }))
    groups = orderBy(groups, 'key')
    groups.forEach(g => {
      g.phonebooks = orderBy(g.phonebooks, 'name')
    })
    return (
      <Layout
        description={intl`Your phonebook contacts`}
        dropdown={[
          {
            label: intl`Create new contact`,
            onPress: Nav.goToPagePhonebookCreate,
          },
          {
            label: intl`Reload`,
            onPress: contactStore.loadContacts,
          },
        ]}
        menu='contact'
        subMenu='phonebook'
        title={intl`Phonebook`}
      >
        <Field
          label={intl`SHOW SHARED CONTACTS`}
          onValueChange={v => {
            g.upsertProfile({
              id: authStore.signedInId,
              displaySharedContacts: v,
            })
          }}
          type='Switch'
          value={authStore.currentProfile.displaySharedContacts}
        />
        <View>
          {groups.map(_g => (
            <React.Fragment key={_g.key}>
              <Field isGroup label={_g.key} />
              {_g.phonebooks.map((u, i) => (
                <UserItem
                  iconFuncs={[() => this.onIcon0(u), () => this.update(u.id)]}
                  icons={[mdiPhone, mdiInformation]}
                  key={i}
                  name={u.name}
                />
              ))}
            </React.Fragment>
          ))}
        </View>
        {contactStore.loading ? (
          <RnText
            style={css.Loading}
            warning
            small
            normal
            center
          >{intl`Loading...`}</RnText>
        ) : contactStore.hasLoadmore ? (
          <RnTouchableOpacity onPress={contactStore.loadMoreContacts}>
            <RnText
              style={css.Loading}
              primary
              small
              normal
              center
            >{intl`Load more contacts`}</RnText>
          </RnTouchableOpacity>
        ) : null}
      </Layout>
    )
  }
}

export default PageContactPhonebook
