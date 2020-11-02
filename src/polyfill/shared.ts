import 'es6-shim'
import 'es7-shim'

import JsSIP from 'jssip'
import MD5 from 'md5'

declare global {
  interface Window {
    JsSIP: typeof JsSIP
    CryptoJS: {
      MD5: Function
    }
  }
}

// Dependency for brekekejs
window.JsSIP = window.JsSIP || JsSIP
window.CryptoJS = window.CryptoJS || { MD5 }
