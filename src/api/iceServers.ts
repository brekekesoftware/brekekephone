// a custom TURN server replaces the PBX one: never both in the ICE list
export const iceServersFor = (
  own?: RTCIceServer,
  pbx?: RTCIceServer,
): RTCIceServer[] => (own ? [own] : pbx ? [pbx] : [])
