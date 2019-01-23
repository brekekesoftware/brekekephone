class CallVoicesPlayer {
  constructor() {
    this._rootElement = null;
  }

  onSessionStatusChanged(ev) {
    let sessionId = ev.sessionId;
    let attrName = 'data-CallVoicesPlayer-id';

    let eAudio = document.querySelector(
      'audio[' + attrName + "='" + sessionId + "']",
    ); //document.getElementById("CallVoicesPlayer" + sessionId );
    if (!eAudio) {
      eAudio = document.createElement('audio');
      eAudio.setAttribute(attrName, sessionId);
      this._rootElement.appendChild(eAudio);
    }
  }
}
export default CallVoicesPlayer;
