const validateHostname = hostname => {
  if (
    /[^\w-.]/.test(hostname) || // any special character exclude - and . => invalid
    /^[-.]/.test(hostname) || // special character at the beginning => invalid
    /[-.]$/.test(hostname) || // special character at the end => invalid
    /\.{2,}/.test(hostname) || // two dots near to each other => invalid
    hostname.length > 255 // too long => invalid
  ) {
    return { status: false, message: 'Host name is invalid' };
  }
  return { status: true, message: '' };
};

export default validateHostname;
