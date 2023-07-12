const fs = require('fs')
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())

const root = '/var/www/upload/'

app.get('/dev-api/builds', (req, res) => {
  res.json(fs.readdirSync(root))
})

app.get('/dev-api/plist/:version', (req, res, next) => {
  const { version } = req.params
  if (!version || !fs.existsSync(`${root}brekeke_phone${version}.ipa`)) {
    next()
    return
  }
  const d = version.startsWith('dev') ? 'dev' : ''
  const v = version.replace('dev', '')
  res.end(plist(d, v))
})

app.listen(3030, () => console.log('listening on port 3030'))

const plist = (d, v) => `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>https://dev01.brekeke.com/upload/brekeke_phone${d}${v}.ipa</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>display-image</string>
          <key>url</key>
          <string>https://dev01.brekeke.com/upload/image.57x57.png</string>
        </dict>
        <dict>
          <key>kind</key>
          <string>full-size-image</string>
          <key>url</key>
          <string>https://dev01.brekeke.com/upload/image.512x512.png</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>com.brekeke.phone${d}</string>
        <key>bundle-version</key>
        <string>${v}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>Brekeke Phone${d ? ' Dev' : ''} ${v}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>
`
