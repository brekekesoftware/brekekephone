/* eslint-disable */

if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '')
  }
}
if (!window.Brekeke) {
  window.Brekeke = {}
}
const Brekeke = window.Brekeke

if (typeof Brekeke.Phonebook === 'undefined') {
  Brekeke.Phonebook = {}
}

Brekeke.Phonebook = {
  toMap(m) {
    if (!m.get) {
      m.get = function (k) {
        return this[k]
      }
    }
  },
  java_get(o, i) {
    return o[i]
  },
  _p: {
    join(ary, sep) {
      var r = ''
      for (var a = 0; a < ary.length; a++) {
        var t = ary[a]
        if (!t) {
          continue
        }
        if (!t.substring) {
          //assuming array or Java array
          t = join(t, sep)
        }
        t = t.trim()
        if (t.length == 0) {
          continue
        }
        if (r.length != 0) {
          r += sep
        }
        r += t
      }
      return r
    },
    firstValid(ary) {
      for (var a = 0; a < ary.length; a++) {
        var t = ary[a]
        if (!t) {
          continue
        }
        if (!t.substring) {
          //assuming array or Java array
          t = firstValid(t, sep)
        }
        t = t.trim()
        if (t.length == 0) {
          continue
        }
        return t
      }
      return ''
    },
    toCaption(key) {
      for (var i in this.item) {
        if (!i || typeof i != 'object') {
          continue
        }
        if (i.id == key) {
          if (i['caption']) {
            return i['caption']
          }
          return key
        }
      }
      return key
    },
  },

  getManager(lang) {
    var fn = this['getManager_' + lang]
    if (!fn) {
      fn = this['getManager_en']
    }
    return fn.call(this)
  },

  getManagers() {
    return [this.getManager('en'), this.getManager('ja')]
  },

  en: null,
  getManager_en() {
    if (this.en != null) {
      return this.en
    }
    this.en = Object.create(this._p)
    var m = this.en

    m.getLang = function () {
      return 'en'
    }
    m.toSortStr = function (map) {
      var ret = this.toDisplayName(map)
      ret = ret.toUpperCase()
      return ret
    }
    m.toDisplayName = function (map) {
      Brekeke.Phonebook.toMap(map)
      var ret = this.firstValid([
        map.get('$nickname'),
        this.join(
          [
            map.get('Prefix'),
            map.get('$firstname'),
            map.get('Middle name'),
            map.get('$lastname'),
            map.get('Suffix'),
          ],
          ' ',
        ),
        map.get('$company'),
        map.get('$tel_mobile'),
        map.get('$tel_home'),
        map.get('$tel_work'),
        map.get('$tel_other'),
      ])
      return ret
    }
    m.item = [
      {
        id: '$nickname',
        caption: 'Nickname',
      },
      {
        id: 'Prefix',
      },
      {
        id: '$firstname',
        caption: 'First name',
        onscreen: true,
      },
      {
        id: 'Middle name',
      },
      {
        id: '$lastname',
        caption: 'Last name',
        onscreen: true,
      },
      {
        id: 'Suffix',
      },
      {
        id: '$title',
        caption: 'Job title',
      },
      {
        id: '$company',
        caption: 'Company',
        onscreen: true,
      },
      {
        id: '$tel_home',
        caption: 'Home',
        onscreen: true,
        type: 'phone',
      },
      {
        id: '$tel_work',
        caption: 'Work',
        onscreen: true,
        type: 'phone',
      },
      {
        id: '$tel_mobile',
        caption: 'Mobile',
        onscreen: true,
        type: 'phone',
      },
      {
        id: '$tel_ext',
        caption: 'Ext.',
        type: 'phone',
      },
      {
        id: '$tel_other',
        caption: 'Other',
        type: 'phone',
      },
      {
        id: '$fax',
        caption: 'Fax',
      },
      {
        id: '$email',
        caption: 'Email',
        onscreen: true,
      },
      {
        id: '$email_work',
        caption: 'Email(Work)',
      },
      {
        id: '$address',
        caption: 'Address',
        onscreen: true,
        type: 'address',
      },
      {
        id: '$address_work',
        caption: 'Address(Work)',
        type: 'address',
      },
      {
        id: '$url',
        caption: 'Website',
      },
      {
        id: '$notes',
        caption: 'Notes',
        onscreen: true,
        type: 'notes',
      },
    ]
    return this.en
  },
  ja: null,
  getManager_ja() {
    if (this.ja != null) {
      return this.ja
    }
    this.ja = Object.create(this._p)
    var m = this.ja

    m.getLang = function () {
      return 'ja'
    }
    ;((m.toHiragana = function (s) {
      s = s.toUpperCase()
      s = '' + s // in case of Java String..
      return s.replace(/[\u30a1-\u30f6]/g, function (match) {
        var c = match.charCodeAt(0) - 0x60
        return String.fromCharCode(c)
      })
    }),
      (m.toSortStr = function (map) {
        var ret = this.toDisplayName(map)
        ret = this.toHiragana(ret)
        return ret
      }))
    m.toDisplayName = function (map) {
      Brekeke.Phonebook.toMap(map)
      var ret = this.firstValid([
        map.get('$nickname'),
        this.join(
          [
            this.firstValid([map.get('$lastname'), map.get('姓（フリガナ）')]),
            this.firstValid([map.get('$firstname'), map.get('名（フリガナ）')]),
          ],
          '',
        ),
        map.get('$company'),
        map.get('$tel_mobile'),
        map.get('$tel_home'),
        map.get('$tel_work'),
        map.get('$tel_other'),
      ])
      return ret
    }
    m.item = [
      {
        id: '$nickname',
        caption: 'ニックネーム',
      },
      {
        id: '$lastname',
        caption: '姓',
        onscreen: true,
      },
      {
        id: '姓（フリガナ）',
        onscreen: true,
      },
      {
        id: '$firstname',
        caption: '名',
        onscreen: true,
      },
      {
        id: '名（フリガナ）',
        onscreen: true,
      },
      {
        id: '$company',
        caption: '会社',
        onscreen: true,
      },
      {
        id: '$title',
        caption: '役職',
      },
      {
        id: '$tel_home',
        caption: '自宅',
        onscreen: true,
        type: 'phone',
      },
      {
        id: '$tel_work',
        caption: '勤務先',
        onscreen: true,
        type: 'phone',
      },
      {
        id: '$tel_mobile',
        caption: '携帯',
        onscreen: true,
        type: 'phone',
      },
      {
        id: '$tel_ext',
        caption: '内線番号',
        type: 'phone',
      },
      {
        id: '$tel_other',
        caption: 'その他',
        type: 'phone',
      },
      {
        id: '$fax',
        caption: 'ファックス',
      },
      {
        id: '$email',
        caption: 'メール',
        onscreen: true,
      },
      {
        id: '$email_work',
        caption: 'メール（仕事用）',
      },
      {
        id: '$address',
        caption: '住所',
        onscreen: true,
        type: 'address',
      },
      {
        id: '$address_work',
        caption: '住所（勤務地）',
        type: 'address',
      },
      {
        id: '$url',
        caption: 'ウェブサイト',
      },
      {
        id: '$notes',
        caption: 'メモ',
        onscreen: true,
        type: 'notes',
      },
    ]
    return this.ja
  },
}
