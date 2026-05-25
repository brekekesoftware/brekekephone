import { observer } from 'mobx-react'
import { Fragment, useEffect, useRef } from 'react'

import { View } from '@/rn/core/components/view'
import { debounce, isEmpty, orderBy } from '@/shared/lodash'
import {
  mdiBriefcase,
  mdiCellphone,
  mdiHome,
  mdiInformation,
  mdiMagnify,
  mdiPhone,
} from '#/assets/icons'
import { UserItem } from '#/components/contact-user-item'
import { Field } from '#/components/field'
import { Layout } from '#/components/layout'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import type { Phonebook } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { RnPicker } from '#/stores/rn-picker'
import { BackgroundTimer } from '#/utils/background-timer'

export const PageContactPhonebook = observer(() => {
  const loadContactsDebounced = useRef(
    debounce(() => {
      ctx.contact.offset = 0
      ctx.contact.loadContacts()
    }, 500),
  ).current

  useEffect(() => {
    ctx.contact.getManageItems()
    const id = BackgroundTimer.setInterval(() => {
      if (!ctx.pbx.client) {
        return
      }
      ctx.contact.loadContactsFirstTime()
      BackgroundTimer.clearInterval(id)
    }, 1000)
    return () => {
      if (ctx.contact.isDeleteState) {
        ctx.contact.isDeleteState = false
        ctx.contact.selectedContactIds = {}
      }
    }
  }, [])

  const update = (id: string) => {
    const contact = ctx.contact.getPhonebookById(id)
    if (contact?.loaded) {
      ctx.nav.goToPagePhonebookUpdate({
        contact,
      })
    } else {
      loadContactDetail(id, (ct: Phonebook) => {
        ctx.nav.goToPagePhonebookUpdate({
          contact: ct,
        })
      })
    }
  }

  const loadContactDetail = (id: string, cb: Function) => {
    ctx.pbx
      .getContact(id)
      .then(ct => {
        if (!ct) {
          return
        }
        const x = {
          ...ct,
          loaded: true,
        }
        ctx.contact.upsertPhonebook(x as Phonebook)
        cb(x)
      })
      .catch((err: Error) => {})
  }

  const callRequest = (number: string, u: Phonebook) => {
    if (number !== '') {
      ctx.call.startCall(number.replace(/\s+/g, ''))
    } else {
      update(u.id)
      RnAlert.error({
        message: intlDebug`This contact doesn't have any phone number`,
      })
    }
  }

  const onIcon0 = (u0: Phonebook) => {
    if (!u0) {
      return
    }

    const onIcon0Inner = (u: Phonebook) => {
      if (!u) {
        return
      }
      if (!u.info.$tel_work && !u.info.$tel_home && !u.info.$tel_mobile) {
        callRequest('', u)
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
        callRequest(numbers[0].value, u)
        return
      }
      RnPicker.open({
        options: numbers.map(i => ({
          key: i.value,
          label: i.value,
          icon: i.icon,
        })),
        onSelect: (e: string) => callRequest(e, u),
      })
    }
    if (u0.loaded) {
      onIcon0Inner(u0)
      return
    }
    loadContactDetail(u0.id, () => {
      onIcon0Inner(u0)
    })
  }

  const updateSearchText = (v: string) => {
    ctx.contact.phonebookSearchTerm = v
    loadContactsDebounced()
    ctx.contact.selectedContactIds = {}
  }

  const onDelete = async () => {
    if (isEmpty(ctx.contact.selectedContactIds)) {
      return
    }
    try {
      const result = await ctx.pbx.deleteContact(
        Object.keys(ctx.contact.selectedContactIds),
      )
      if (result?.succeeded?.length) {
        ctx.contact.removeContacts(result.succeeded)
      }
      ctx.contact.selectedContactIds = {}
    } catch (err) {
      console.error(err)
    }
  }
  const onCancel = () => {
    ctx.contact.isDeleteState = false
    ctx.contact.selectedContactIds = {}
  }

  const phonebooks = ctx.contact.phoneBooks
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
        `(${Object.keys(ctx.contact.selectedContactIds).length})`,
      onPress: onDelete,
    },
    {
      label: intl`Cancel`,
      onPress: onCancel,
    },
  ]
  const options = [
    {
      label: intl`Create new contact`,
      onPress: ctx.nav.goToPagePhonebookCreate,
    },
    {
      label: intl`Delete contacts`,
      onPress: () => {
        ctx.contact.isDeleteState = true
      },
    },
    {
      label: intl`Reload`,
      onPress: ctx.contact.loadContacts,
    },
  ]

  return (
    <Layout
      description={intl`Your phonebook contacts`}
      dropdown={ctx.contact.isDeleteState ? optionDelete : options}
      menu='contact'
      subMenu='phonebook'
      title={intl`Phonebook`}
    >
      <Field
        icon={mdiMagnify}
        label={intl`SEARCH CONTACTS`}
        onValueChange={updateSearchText}
        value={ctx.contact.phonebookSearchTerm}
      />
      <View>
        {groups.map(gr => (
          <Fragment key={gr.key}>
            <Field isGroup label={gr.key} />
            {gr.phonebooks.map((u, i) =>
              ctx.contact.isDeleteState ? (
                <RnTouchableOpacity
                  onPress={() => ctx.contact.selectContactId(u.id)}
                  disabled={u.shared}
                >
                  <UserItem
                    key={i}
                    name={u?.display_name || intl`<Unnamed>`}
                    isSelection
                    isSelected={ctx.contact.selectedContactIds[u.id]}
                    disabled={u.shared}
                    onSelect={() => ctx.contact.selectContactId(u.id)}
                  />
                </RnTouchableOpacity>
              ) : (
                <UserItem
                  iconFuncs={[() => onIcon0(u), () => update(u.id)]}
                  icons={[mdiPhone, mdiInformation]}
                  key={i}
                  phonebook={`${u.phonebook}${u.shared ? 'S' : ''}`}
                  name={`${u?.display_name || intl`<Unnamed>`}`}
                  phonebookInfo={u}
                  canTouch
                />
              ),
            )}
          </Fragment>
        ))}
      </View>
      {ctx.contact.loading ? (
        <RnText
          className='mt-5'
          warning
          small
          normal
          center
        >{intl`Loading...`}</RnText>
      ) : ctx.contact.hasLoadmore ? (
        <RnTouchableOpacity onPress={ctx.contact.loadMoreContacts}>
          <RnText
            className='mt-5'
            primary
            small
            normal
            center
          >{intl`Load more contacts`}</RnText>
        </RnTouchableOpacity>
      ) : null}
    </Layout>
  )
})
