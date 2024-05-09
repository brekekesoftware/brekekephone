import { debounce, isEmpty, orderBy } from 'lodash'
import { observer } from 'mobx-react'
import { Component, Fragment } from 'react'
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
import { getCallStore } from '../stores/callStore'
import type { Phonebook } from '../stores/contactStore'
import { contactStore } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
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
  componentDidMount = () => {
    contactStore.getManageItems()
    const id = BackgroundTimer.setInterval(() => {
      if (!pbx.client) {
        return
      }
      contactStore.loadContactsFirstTime()
      BackgroundTimer.clearInterval(id)
    }, 1000)
  }
  componentWillUnmount = () => {
    if (contactStore.isDeleteState) {
      contactStore.isDeleteState = false
      contactStore.selectedContactIds = {}
    }
  }
  update = (id: string) => {
    const contact = contactStore.getPhonebookById(id)
    if (contact?.loaded) {
      Nav().goToPagePhonebookUpdate({
        contact,
      })
    } else {
      this.loadContactDetail(id, (ct: Phonebook) => {
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
        }
        contactStore.upsertPhonebook(x as Phonebook)
        cb(x)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to load contact detail for ${id}`,
          err,
        })
      })
  }

  callRequest = (number: string, u: Phonebook) => {
    if (number !== '') {
      getCallStore().startCall(number.replace(/\s+/g, ''))
    } else {
      this.update(u.id)
      RnAlert.error({
        message: intlDebug`This contact doesn't have any phone number`,
      })
    }
  }

  onIcon0 = (u0: Phonebook) => {
    if (!u0) {
      return
    }

    const onIcon0 = (u: Phonebook) => {
      if (!u) {
        return
      }
      if (!u.info.$tel_work && !u.info.$tel_home && !u.info.$tel_mobile) {
        this.callRequest('', u)
        return
      }
      const numbers: {
        key: string
        value: string
        icon: string
      }[] = []
      if (u.info.$tel_work) {
        numbers.push({
          key: 'workNumber',
          value: u.info.$tel_work,
          icon: mdiBriefcase,
        })
      }
      if (u.info.$tel_mobile) {
        numbers.push({
          key: 'cellNumber',
          value: u.info.$tel_mobile,
          icon: mdiCellphone,
        })
      }
      if (u.info.$tel_home) {
        numbers.push({
          key: 'homeNumber',
          value: u.info.$tel_home,
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
    this.loadContactsDebounced()
    contactStore.selectedContactIds = {}
  }
  loadContactsDebounced = debounce(() => {
    contactStore.offset = 0
    contactStore.loadContacts()
  }, 500)

  onDelete = async () => {
    if (isEmpty(contactStore.selectedContactIds)) {
      return
    }
    try {
      const result = await pbx.deleteContact(
        Object.keys(contactStore.selectedContactIds),
      )
      if (result?.succeeded?.length) {
        contactStore.removeContacts(result.succeeded)
      }
      contactStore.selectedContactIds = {}
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to delete contact`,
        err: err as Error,
      })
    }
  }
  onCancel = () => {
    contactStore.isDeleteState = false
    contactStore.selectedContactIds = {}
  }
  render() {
    const phonebooks = contactStore.phoneBooks
    const map = {} as { [k: string]: Phonebook[] }
    phonebooks.forEach(u => {
      let c0 = u?.display_name?.charAt(0).toUpperCase()
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
    const optionDelete = [
      {
        label:
          intl`Delete ` +
          `(${Object.keys(contactStore.selectedContactIds).length})`,
        onPress: this.onDelete,
      },
      {
        label: intl`Cancel`,
        onPress: this.onCancel,
      },
    ]
    const options = [
      {
        label: intl`Create new contact`,
        onPress: Nav().goToPagePhonebookCreate,
      },
      {
        label: intl`Delete contacts`,
        onPress: () => {
          contactStore.isDeleteState = true
        },
      },
      {
        label: intl`Reload`,
        onPress: contactStore.loadContacts,
      },
    ]

    return (
      <Layout
        description={intl`Your phonebook contacts`}
        dropdown={contactStore.isDeleteState ? optionDelete : options}
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
        <View>
          {groups.map(gr => (
            <Fragment key={gr.key}>
              <Field isGroup label={gr.key} />
              {gr.phonebooks.map((u, i) =>
                contactStore.isDeleteState ? (
                  <RnTouchableOpacity
                    onPress={() => contactStore.selectContactId(u.id)}
                    disabled={u.shared}
                  >
                    <UserItem
                      key={i}
                      name={u?.display_name || intl`<Unnamed>`}
                      isSelection
                      isSelected={contactStore.selectedContactIds[u.id]}
                      disabled={u.shared}
                      onSelect={() => contactStore.selectContactId(u.id)}
                    />
                  </RnTouchableOpacity>
                ) : (
                  <UserItem
                    iconFuncs={[() => this.onIcon0(u), () => this.update(u.id)]}
                    icons={[mdiPhone, mdiInformation]}
                    key={i}
                    phonebook={`${u.phonebook}${u.shared ? 'Ⓢ' : ''}`}
                    name={`${u?.display_name || intl`<Unnamed>`}`}
                  />
                ),
              )}
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
