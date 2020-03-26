const os = 1000;
const om = 60 * os;
const oh = 60 * om;

export default ms => {
  const h = Math.floor(ms / oh);
  ms %= oh;
  let m = Math.floor(ms / om);
  if (m < 10) {
    m = `0` + m;
  }
  ms %= om;
  let s = Math.floor(ms / os);
  if (s < 10) {
    s = `0` + s;
  }
  return (h ? `${h}:` : ``) + `${m}:${s}`;
};
