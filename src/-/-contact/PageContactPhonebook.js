import {
  mdiBriefcase,
  mdiCellphone,
  mdiHome,
  mdiInformation,
  mdiPhone,
} from '@mdi/js'
import debounce from 'lodash/debounce'
import orderBy from 'lodash/orderBy'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import g from '../global'
import authStore from '../global/authStore'
import callStore from '../global/callStore'
import contactStore from '../global/contactStore'
import intl, { intlDebug } from '../intl/intl'
import { StyleSheet, Text, View } from '../Rn'
import Field from '../shared/Field'
import Layout from '../shared/Layout'
import { arrToMap } from '../utils/toMap'
import UserItem from './UserItem'

const numberOfContactsPerPage = 30
const formatPhoneNumber = number => number.replace(/\D+/g, '')

const css = StyleSheet.create({
  Loading: {
    marginTop: 20,
  },
})

@observer
class PageContactPhonebook extends React.Component {
  @computed get phoneBookId() {
    return contactStore.phoneBooks.map(p => p.id)
  }
  @computed get phoneBookById() {
    return arrToMap(contactStore.phoneBooks, 'id', p => p)
  }
  state = {
    loading: false,
  }
  componentDidMount() {
    const id = setInterval(() => {
      if (!pbx.client) {
        return
      }
      this.loadContactsFirstTime()
      clearInterval(id)
    }, 300)
  }

  loadContactsFirstTime = () => {
    if (contactStore.alreadyLoadContactsFirstTime) {
      return
    }
    this.loadContacts()
    contactStore.alreadyLoadContactsFirstTime = true
  }
  loadContacts = debounce(() => {
    const query = this.props
    const book = query.book
    const shared = true
    const opts = {
      limit: numberOfContactsPerPage,
      offset: query.offset,
      searchText: query.searchText,
    }
    this.setState({ loading: true })
    pbx
      .getContacts(book, shared, opts)
      .then(contacts => {
        contactStore.setPhonebook(contacts)
      })
      .catch(err => {
        g.showError({
          message: intlDebug`Failed to load contact list`,
          err,
        })
      })
      .then(() => {
        this.setState({ loading: false })
      })
  }, 500)

  call = number => {
    number = formatPhoneNumber(number)
    callStore.startCall(number)
  }
  create = () => {
    g.goToPagePhonebookCreate({
      book: this.props.book,
    })
  }
  update = id => {
    const contact = contactStore.getPhonebook(id)
    if (!!contact.loaded) {
      g.goToPagePhonebookUpdate({
        contact: contact,
      })
    } else {
      pbx
        .getContact(id)
        .then(ct => {
          Object.assign(ct, { loaded: true })
          contactStore.updatePhonebook(ct)
          g.goToPagePhonebookUpdate({
            contact: ct,
          })
        })
        .catch(err => {
          g.showError({
            message: intlDebug`Failed to load contact detail for ${id}`,
            err,
          })
        })
    }
  }
  callRequest = (number, contact) => {
    if (number !== '') {
      this.call(number)
    } else {
      this.update(contact)
      g.showError({
        message: intlDebug`This contact doesn't have any phone number`,
      })
    }
  }

  onIcon0 = u => {
    if (!u.homeNumber && !u.workNumber && !u.cellNumber) {
      this.callRequest('', u)
      return
    }

    const numbers = []
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
    g.openPicker({
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
            onPress: this.create,
          },
          {
            label: intl`Reload`,
            onPress: this.loadContacts,
          },
        ]}
        menu="contact"
        subMenu="phonebook"
        title={this.props.book || intl`Phonebook`}
      >
        <Field
          label={intl`SHOW SHARED CONTACTS`}
          onValueChange={v => {
            g.upsertProfile({
              id: authStore.currentProfile.id,
              displaySharedContacts: v,
            })
          }}
          type="Switch"
          value={authStore.currentProfile.displaySharedContacts}
        />
        {this.state.loading && (
          <Text
            style={css.Loading}
            warning
            small
            normal
            center
          >{intl`Loading...`}</Text>
        )}
        {!this.state.loading && (
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
        )}
      </Layout>
    )
  }
}

export default PageContactPhonebook
