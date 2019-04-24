const validateHostname = hostname => {
  if (
    /[^\w-.]/.test(hostname) || // any special character exclude - and . => invalid
    /^[-.]/.test(hostname) || // special character at the beginning => invalid
    /[-.]$/.test(hostname) || // special character at the end => invalid
    /\.{2,}/.test(hostname) || // two dots near to each other => invalid
    hostname.length > 255 // too long => invalid
  ) {
    return 'Host name is invalid';
  }
  return;
};

const validatePort = port => {
  if (
    /\D/.test(port) || // non numeric character => invalid
    /^0/.test(port) || // starts with 0 => invalid
    parseInt(port) > 65535 // greater than max => invalid
  ) {
    return 'Port is invalid';
  }
  return;
};

export { validateHostname, validatePort };
