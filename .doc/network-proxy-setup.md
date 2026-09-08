### Network proxy setup instruction

- Before setup/enable the proxy, check your public IP address first and save it somewhere to compare later
- To setup/enable/disable proxy:
  - Browser - Chrome
    - I'm currently using this extension to set proxy on Chrome browser: https://chrome.google.com/webstore/detail/proxy-switcher-and-manage/onnfghpihccifgojkpnnncpagjcdbjod
    - After installing the extension, click on it and click on Manual Proxy tab, fill in all the Host + Port for all options HTTP, SSL, FTP... Then click outside of the extension to hide it, you can see the extension icon is red (which is in manual mode we have just input)
    - Then when you need to disable the proxy, click on the System Proxy tab
  - Android
    - After connected to a Wifi network, you go to the Wifi network list, and see near the Current Network there should be a cog icon there, or find in that page a cog icon, click on it > Advanced > Proxy > Manual
    - Input the proxy config there
    - Then when you need to disable the proxy, disable proxy just change it to None
  - iOS
    - After connected to a Wifi network, you go to the Wifi network list, and see near the Current Network there should be a info icon there, click on it > Configure Proxy > Manual
    - Input the proxy config there
    - Then when you need to disable the proxy, disable proxy just change it to Off
- After you setup/enable the proxy, you can open a new browser tab and check your new public IP address now, see if it has changed to the same proxy IP address yet or not. If it has changed then proxy is working now
- Now you can open Brekeke Phone mobile app or in-browser, to sign in to an account, create a call/session and go to pbx admin to see the log there if it's logged as the proxied IP address
