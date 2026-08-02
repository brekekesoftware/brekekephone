### Network proxy setup instruction

<!-- START doctoc -->
<!-- END doctoc -->

- Before setting up the proxy, check your current public IP address and save it somewhere to compare later.
- To set up/enable/disable the proxy:
  - Browser (Chrome)
    - A proxy switcher extension works well for this, for example https://chrome.google.com/webstore/detail/proxy-switcher-and-manage/onnfghpihccifgojkpnnncpagjcdbjod
    - After installing it, open the extension and go to its Manual Proxy tab, fill in the Host + Port for HTTP, SSL, FTP, etc. Click outside the extension to close it -- the icon turns red to indicate manual mode is active.
    - To disable the proxy again, open the extension and switch to its System Proxy tab.
  - Android
    - Connect to a Wi-Fi network, open the Wi-Fi network list, tap the cog/settings icon next to the connected network, then `Advanced > Proxy > Manual`.
    - Enter the proxy config there.
    - To disable it, change the proxy setting back to `None`.
  - iOS
    - Connect to a Wi-Fi network, open the Wi-Fi network list, tap the info icon next to the connected network, then `Configure Proxy > Manual`.
    - Enter the proxy config there.
    - To disable it, change the proxy setting back to `Off`.
- After enabling the proxy, open a new browser tab and check your public IP address again to confirm it changed to the proxy's IP address.
- Now sign in to an account in the Brekeke Phone app (or in-browser), place a call/session, and check the PBX admin log to confirm it shows the proxied IP address.
