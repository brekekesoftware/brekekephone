import { debounce } from 'lodash'
import { observer } from 'mobx-react'
import { Component, Fragment } from 'react'
import { StyleSheet, View } from 'react-native'

import { pbx } from '../api/pbx'
import { mdiBriefcase, mdiCellphone, mdiHome } from '../assets/icons'
import { UserItem } from '../components/ContactUserItem'
import { Field } from '../components/Field'
import { Layout } from '../components/Layout'
import { RnText, RnTouchableOpacity } from '../components/Rn'
import { contactStore, Phonebook2 } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnPicker } from '../stores/RnPicker'

const css = StyleSheet.create({
  Loading: {
    marginTop: 20,
  },
})

@observer
export class PageContactDelete extends Component {
  componentDidMount() {}

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
      let c0 = u?.display_name?.charAt(0).toUpperCase()
      if (!/[A-Z]/.test(c0)) {
        c0 = '#'
      }
      if (!map[c0]) {
        map[c0] = []
      }
      map[c0].push(u)
    })

    const groups = Object.keys(map).map(k => ({
      key: k,
      phonebooks: map[k],
    }))

    const onDelete = () => {}
    return (
      <Layout
        description={intl`Choose contacts do you want to delete`}
        onBack={Nav().backToPageContactPhonebook}
        title={intl`Delete contacts`}
        dropdown={[
          {
            label:
              intl`Delete ` +
              `(${Object.keys(contactStore.selectedContactIds).length})`,
            onPress: onDelete,
          },
          {
            label: intl`Delete All`,
            onPress: onDelete,
          },
        ]}
      >
        <View>
          {groups.map(gr => (
            <Fragment key={gr.key}>
              <Field isGroup label={gr.key} />
              {gr.phonebooks.map((u, i) => (
                <UserItem
                  key={i}
                  name={u?.display_name || intl`<Unnamed>`}
                  isSelection
                  isSelected={contactStore.selectedContactIds[u.id]}
                  disabled={u.shared}
                  onSelect={() => contactStore.selectContactId(u.id)}
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
