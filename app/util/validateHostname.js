const validateHostname = hostname => {
  if (
    /^\W/.test(hostname) || // special character at the beginning => invalid
    /\W$/.test(hostname) || // special character at the end => invalid
    /[^\w-]{2,}/.test(hostname) || // two special characters near to each other => invalid
    hostname.length > 255 // too long => invalid
  ) {
    return { status: false, message: 'Host name is invalid' };
  }
  return { status: true, message: '' };
};

export default validateHostname;
