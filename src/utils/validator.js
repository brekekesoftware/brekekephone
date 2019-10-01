import Validator from 'validatorjs';
import en from 'validatorjs/src/lang/en';

Validator.setMessages(`en`, {
  ...en,
  required: `This field is required`,
});
Validator.useLang(`en`);

Validator.register(
  `hostname`,
  v =>
    !(
      /[^\w-.]/.test(v) || // any special character except - . => invalid
      /^[-.]/.test(v) || // special character at the beginning => invalid
      /[-.]$/.test(v) || // special character at the end => invalid
      /\.{2,}/.test(v) || // two dots near to each other => invalid
      v.length > 255 || // too long => invalid
      false
    ),
  `Invalid host name`,
);

Validator.register(
  `port`,
  v =>
    !(
      /\D/.test(v) || // non numeric character => invalid
      /^0/.test(v) || // starts with 0 => invalid
      parseInt(v) > 65535 || // greater than max => invalid
      false
    ),
  `Invalid port`,
);
