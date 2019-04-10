const validatePort = port => {
  if (
    /\D/.test(port) || // non numeric character => invalid
    /^0/.test(port) || // starts with 0 => invalid
    parseInt(port) > 65535 // greater than max => invalid
  ) {
    return { status: false, message: 'Port is invalid' };
  }
  return { status: true, message: '' };
};

export default validatePort;
