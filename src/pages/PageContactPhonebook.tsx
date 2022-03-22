import { debounce } from 'lodash'
import orderBy from 'lodash/orderBy'
import { observer } from 'mobx-react'
import React, { Component, Fragment } from 'react'
import { StyleSheet, View } from 'react-native'

import { pbx } from '../api/pbx'
import {
  mdiBriefcase,
  mdiCellphone,
  mdiHome,
  mdiInformation,
  mdiMagnify,
  mdiPhone,
} from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText, RnTouchableOpacity } from '../components/Rn'
import { getAuthStore } from '../stores/authStore'
import { callStore } from '../stores/callStore'
import { contactStore, Phonebook2 } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { profileStore } from '../stores/profileStore'
import { RnAlert } from '../stores/RnAlert'
import { RnPicker } from '../stores/RnPicker'
import { BackgroundTimer } from '../utils/BackgroundTimer'

const css = StyleSheet.create({
  Loading: {
    marginTop: 20,
  },
})

@observer
export class PageContactPhonebook extends Component {
  componentDidMount() {
    const id = BackgroundTimer.setInterval(() => {
      if (!pbx.client) {
        return
      }
      contactStore.loadContactsFirstTime()
      BackgroundTimer.clearInterval(id)
    }, 1000)
  }

  update = (id: string) => {
    const contact = contactStore.getPhonebookById(id)
    if (contact?.loaded) {
      Nav().goToPagePhonebookUpdate({
        contact,
      })
    } else {
      this.loadContactDetail(id, (ct: Phonebook2) => {
        Nav().goToPagePhonebookUpdate({
          contact: ct,
        })
      })
    }
  }

  loadContactDetail = (id: string, cb: Function) => {
    pbx
      .getContact(id)
      .then(ct => {
        if (!ct) {
          return
        }
        const x = {
          ...ct,
          loaded: true,
          name: ct.firstName + ' ' + ct.lastName,
          hidden: ct.hidden === 'true',
        }
        contactStore.upsertPhonebook(x)
        cb(x)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to load contact detail for ${id}`,
          err,
        })
      })
  }

  callRequest = (number: string, u: Phonebook2) => {
    if (number !== '') {
      callStore.startCall(number.replace(/\s+/g, ''))
    } else {
      this.update(u.id)
      RnAlert.error({
        message: intlDebug`This contact doesn't have any phone number`,
      })
    }
  }

  onIcon0 = (u0: Phonebook2) => {
    if (!u0) {
      return
    }
    const onIcon0 = (u: Phonebook2) => {
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
        onSelect: (e: string) => this.callRequest(e, u),
      })
    }
    if (u0.loaded) {
      onIcon0(u0)
      return
    }
    this.loadContactDetail(u0.id, () => {
      onIcon0(u0)
    })
  }

  updateSearchText = (v: string) => {
    contactStore.phonebookSearchTerm = v
    this.updateListPhoneBook()
  }

  updateListPhoneBook = debounce(() => {
    contactStore.offset = 0
    contactStore.loadContacts()
  }, 500)

  render() {
    const phonebooks = contactStore.phoneBooks

    const map = {} as { [k: string]: Phonebook2[] }
    phonebooks.forEach(u => {
      let c0 = u?.name?.charAt(0).toUpperCase()
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
    groups.forEach(gr => {
      gr.phonebooks = orderBy(gr.phonebooks, 'name')
    })
    return (
      <Layout
        description={intl`Your phonebook contacts`}
        dropdown={[
          {
            label: intl`Create new contact`,
            onPress: Nav().goToPagePhonebookCreate,
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
          icon={mdiMagnify}
          label={intl`SEARCH CONTACTS`}
          onValueChange={this.updateSearchText}
          value={contactStore.phonebookSearchTerm}
        />
        <Field
          label={intl`SHOW SHARED CONTACTS`}
          onValueChange={(v: boolean) => {
            profileStore.upsertProfile({
              id: getAuthStore().signedInId,
              displaySharedContacts: v,
            })
            contactStore.refreshContacts()
          }}
          type='Switch'
          value={getAuthStore().currentProfile?.displaySharedContacts}
        />
        <View>
          {groups.map(gr => (
            <Fragment key={gr.key}>
              <Field isGroup label={gr.key} />
              {gr.phonebooks.map((u, i) => (
                <UserItem
                  iconFuncs={[() => this.onIcon0(u), () => this.update(u.id)]}
                  icons={[mdiPhone, mdiInformation]}
                  key={i}
                  name={u.name}
                />
              ))}
            </Fragment>
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
