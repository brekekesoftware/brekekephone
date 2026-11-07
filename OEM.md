# OEM: branding the web phone

A PBX packager brands the web phone with two optional files. No code change and no rebuild.

## Files

Put `oem.js` and `favicon.ico` in the same folder as `index.html` (the folder the web phone is served from).
With no `oem.js` the web phone keeps the Brekeke look, as before.

## Example

Copy this block as `oem.js`:

```js
window.brekekeOem = {
  openInApp: false,
  colors: {
    primary: '#1E6FD9',
    warning: '#F1AF20',
    danger: '#DC0F39',
    info: '#4ac5de',
  },
  productName: 'Acme Phone',
}
```

## Keys

- `openInApp: false`: phones open the web phone directly, with no OPEN IN APP button.
- `colors.primary`: `#RRGGBB`; every shade of the main color follows it.
- `colors.warning`, `colors.danger`, `colors.info`: `#RRGGBB`, each replaces its Brekeke color.
- `productName`: the SIP and PAL User-Agent becomes "<name> for Web ...", and it is the default notification title.
- `favicon.ico`: the icon of web notifications.
- A bad value is ignored and logged once in the browser console with `oem.js:`; the Brekeke value stays.

## Limits

- The embed (webphone.js inside a host page) is not covered and keeps the dev01 icon.
- Native apps (Android, iOS) need their own builds.
- The browser's own HTTP User-Agent cannot change.
- The PBX setting `webphone.useragent` wins over `productName`.
- The page title stays "Web Phone".
- Values are read once at load: reload the page after a change.

## Updates

`deploy-web.sh` (and any update that swaps the whole folder) removes `oem.js` and `favicon.ico`.
After every update, copy both files back beside `index.html`.
