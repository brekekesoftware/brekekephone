import Validator from 'validatorjs'
import en from 'validatorjs/src/lang/en'

/**
 * TODO: use a custom validator with our intl instead
 */
export const registerValidatorLabels = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  Validator.useLang('en')

  Validator.setMessages('en', {
    ...en,
    required: 'This field is required',
  })

  Validator.register(
    'hostname',
    v => {
      if (typeof v !== 'string') {
        return false
      }
      return !(
        /[^\w-.]/.test(v) || // any special character except - . => invalid
        /^[-.]/.test(v) || // special character at the beginning => invalid
        /[-.]$/.test(v) || // special character at the end => invalid
        /\.{2,}/.test(v) || // two dots near to each other => invalid
        v.length > 255 || // too long => invalid
        false
      )
    },
    'Invalid host name',
  )

  Validator.register(
    'port',
    v => {
      if (typeof v !== 'string') {
        return false
      }
      return !(
        /\D/.test(v) || // non numeric character => invalid
        /^0/.test(v) || // starts with 0 => invalid
        parseInt(v) > 65535 || // greater than max => invalid
        false
      )
    },
    'Invalid port',
  )
}
