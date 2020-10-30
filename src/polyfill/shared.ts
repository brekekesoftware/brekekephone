import 'es6-shim'
import 'es7-shim'

import MD5 from 'crypto-js/md5'
import JsSIP from 'jssip/lib/JsSIP'

// @ts-ignore
// Dependency for brekekejs
window.JsSIP = window.JsSIP || JsSIP
// @ts-ignore
// Dependency for brekekejs
window.CryptoJS = { MD5 }
