export default function validateHostname(host_name) {
  let special_characters = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (
    special_characters.test(host_name[0]) ||
    special_characters.test(host_name.slice(-1)) ||
    host_name.length > 255
  ) {
    // hostname start and end as special character  and length > 255
    return { status: false, message: 'Hostname is invalid' };
  }
  return { status: true, message: '' };
}
