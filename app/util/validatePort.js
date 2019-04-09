export default function validatePort(port) {
  if (!/^[0][1-9]\d{0,4}$|^[1-9]\d{0,4}$/i.test(port)) {
    //  port 0-65536
    return { status: false, message: 'Port is invalid' };
  }
  return { status: true, message: '' };
}
